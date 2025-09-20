/**
 * WebSocket Terminal Server
 * Real-time terminal execution with session management
 */

import { WebSocket, WebSocketServer } from 'ws';
import { spawn, ChildProcess } from 'child_process';
import * as pty from 'node-pty';

interface TerminalSession {
  id: string;
  process?: any; // PTY process
  buffer: string[];
  cwd: string;
  shell: string;
  createdAt: Date;
  lastActivity: Date;
  userId?: string;
}

interface TerminalMessage {
  type: 'input' | 'resize' | 'init' | 'close' | 'ping';
  data?: string;
  cols?: number;
  rows?: number;
  sessionId?: string;
}

export class TerminalWebSocketServer {
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, TerminalSession> = new Map();
  private clients: Map<string, WebSocket> = new Map();
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    this.setupCleanupInterval();
  }

  public initialize(port: number = 3002): void {
    if (this.wss) {
      console.warn('WebSocket server already initialized');
      return;
    }

    this.wss = new WebSocketServer({
      port,
      perMessageDeflate: false,
      clientTracking: true
    });

    this.wss.on('connection', (ws, req) => {
      const sessionId = this.generateSessionId();
      console.log(`New terminal WebSocket connection: ${sessionId}`);

      // Store client connection
      this.clients.set(sessionId, ws);

      // Send session ID to client
      ws.send(JSON.stringify({
        type: 'session',
        sessionId,
        message: 'Terminal session created'
      }));

      ws.on('message', (data) => {
        try {
          const message: TerminalMessage = JSON.parse(data.toString());
          this.handleMessage(sessionId, message, ws);
        } catch (error) {
          console.error('Invalid terminal message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      });

      ws.on('close', () => {
        console.log(`Terminal WebSocket disconnected: ${sessionId}`);
        this.cleanupSession(sessionId);
      });

      ws.on('error', (error) => {
        console.error(`Terminal WebSocket error for ${sessionId}:`, error);
        this.cleanupSession(sessionId);
      });

      // Send heartbeat
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(heartbeat);
        }
      }, 30000);
    });

    console.log(`Terminal WebSocket server listening on port ${port}`);
  }

  private handleMessage(sessionId: string, message: TerminalMessage, ws: WebSocket): void {
    switch (message.type) {
      case 'init':
        this.initializeTerminal(sessionId, ws, message);
        break;
      case 'input':
        this.handleInput(sessionId, message.data || '');
        break;
      case 'resize':
        this.resizeTerminal(sessionId, message.cols || 80, message.rows || 24);
        break;
      case 'close':
        this.closeTerminal(sessionId);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }

  private initializeTerminal(sessionId: string, ws: WebSocket, message: TerminalMessage): void {
    try {
      // Check for existing session
      if (this.sessions.has(sessionId)) {
        const session = this.sessions.get(sessionId)!;
        session.lastActivity = new Date();
        ws.send(JSON.stringify({
          type: 'output',
          data: session.buffer.join('')
        }));
        return;
      }

      // Determine shell based on platform
      const isWindows = process.platform === 'win32';
      const shell = isWindows ? 'powershell.exe' : process.env.SHELL || '/bin/bash';
      const cwd = process.cwd();

      // Try to use node-pty for better terminal emulation
      // Fall back to child_process if node-pty is not available
      let terminalProcess: any;

      try {
        // Dynamic import to handle optional dependency
        const ptyModule = require('node-pty');

        terminalProcess = ptyModule.spawn(shell, [], {
          name: 'xterm-256color',
          cols: message.cols || 80,
          rows: message.rows || 24,
          cwd: cwd,
          env: { ...process.env, TERM: 'xterm-256color' }
        });

        terminalProcess.onData((data: string) => {
          this.sendOutput(sessionId, data);
        });

        terminalProcess.onExit(() => {
          this.handleTerminalExit(sessionId);
        });

      } catch (ptyError) {
        // Fallback to basic child_process
        console.warn('node-pty not available, using basic terminal:', ptyError);

        terminalProcess = spawn(shell, [], {
          cwd: cwd,
          env: process.env,
          shell: true
        });

        terminalProcess.stdout?.on('data', (data: Buffer) => {
          this.sendOutput(sessionId, data.toString());
        });

        terminalProcess.stderr?.on('data', (data: Buffer) => {
          this.sendOutput(sessionId, data.toString());
        });

        terminalProcess.on('exit', () => {
          this.handleTerminalExit(sessionId);
        });
      }

      // Create session
      const session: TerminalSession = {
        id: sessionId,
        process: terminalProcess,
        buffer: [],
        cwd: cwd,
        shell: shell,
        createdAt: new Date(),
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, session);

      // Send initialization success
      ws.send(JSON.stringify({
        type: 'initialized',
        shell: shell,
        cwd: cwd
      }));

      // Send welcome message
      const welcomeMessage = `
CroweCode Terminal v4.0
Connected to ${shell} at ${cwd}
Session ID: ${sessionId}
Type 'help' for available commands
`;
      this.sendOutput(sessionId, welcomeMessage);

    } catch (error) {
      console.error('Failed to initialize terminal:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to initialize terminal session'
      }));
    }
  }

  private handleInput(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.process) {
      console.warn(`No terminal session found for ${sessionId}`);
      return;
    }

    session.lastActivity = new Date();

    try {
      // Handle special commands
      if (data === '\x03') { // Ctrl+C
        if ('kill' in session.process) {
          session.process.kill('SIGINT');
        } else {
          session.process.kill('SIGINT');
        }
        return;
      }

      if (data === '\x04') { // Ctrl+D
        this.closeTerminal(sessionId);
        return;
      }

      // Write input to terminal
      if ('write' in session.process) {
        session.process.write(data);
      } else if (session.process.stdin) {
        session.process.stdin.write(data);
      }
    } catch (error) {
      console.error(`Error handling input for ${sessionId}:`, error);
    }
  }

  private resizeTerminal(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.process) {
      return;
    }

    session.lastActivity = new Date();

    try {
      if ('resize' in session.process) {
        session.process.resize(cols, rows);
      }
      // Basic child_process doesn't support resize
    } catch (error) {
      console.error(`Error resizing terminal for ${sessionId}:`, error);
    }
  }

  private sendOutput(sessionId: string, data: string): void {
    const ws = this.clients.get(sessionId);
    const session = this.sessions.get(sessionId);

    if (!session) {
      return;
    }

    // Buffer output
    session.buffer.push(data);

    // Limit buffer size (keep last 10000 chars)
    const bufferText = session.buffer.join('');
    if (bufferText.length > 10000) {
      session.buffer = [bufferText.slice(-10000)];
    }

    // Send to client if connected
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'output',
        data: data
      }));
    }
  }

  private handleTerminalExit(sessionId: string): void {
    const ws = this.clients.get(sessionId);

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'exit',
        message: 'Terminal session ended'
      }));
    }

    this.cleanupSession(sessionId);
  }

  private closeTerminal(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session || !session.process) {
      return;
    }

    try {
      if ('kill' in session.process) {
        session.process.kill();
      } else {
        session.process.kill();
      }
    } catch (error) {
      console.error(`Error closing terminal for ${sessionId}:`, error);
    }

    this.cleanupSession(sessionId);
  }

  private cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session && session.process) {
      try {
        if ('kill' in session.process) {
          session.process.kill();
        } else if (session.process.kill) {
          session.process.kill();
        }
      } catch (error) {
        console.error(`Error killing process for ${sessionId}:`, error);
      }
    }

    this.sessions.delete(sessionId);
    this.clients.delete(sessionId);
  }

  private setupCleanupInterval(): void {
    // Clean up inactive sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = new Date();
      const timeout = 30 * 60 * 1000; // 30 minutes

      for (const [sessionId, session] of this.sessions) {
        if (now.getTime() - session.lastActivity.getTime() > timeout) {
          console.log(`Cleaning up inactive session: ${sessionId}`);
          this.cleanupSession(sessionId);
        }
      }
    }, 5 * 60 * 1000);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  public getSessionCount(): number {
    return this.sessions.size;
  }

  public getActiveSession(sessionId: string): TerminalSession | undefined {
    return this.sessions.get(sessionId);
  }

  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    // Close all sessions
    for (const sessionId of this.sessions.keys()) {
      this.cleanupSession(sessionId);
    }

    // Close WebSocket server
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
  }
}

// Export singleton instance
export const terminalWebSocketServer = new TerminalWebSocketServer();
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import { X, Minimize2, Maximize2, Square, RotateCcw } from 'lucide-react';

interface TerminalProps {
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMinimized?: boolean;
  isMaximized?: boolean;
  className?: string;
}

export default function Terminal({
  onClose,
  onMinimize,
  onMaximize,
  isMinimized,
  isMaximized,
  className = ''
}: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!terminalRef.current || isMinimized) return;

    // Initialize terminal
    terminal.current = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#d4d4d4',
        cursor: '#ffffff',
        cursorAccent: '#000000',
        selection: '#3399ff40',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff'
      },
      cols: 80,
      rows: 24,
      convertEol: true,
      disableStdin: false,
      cursorStyle: 'block'
    });

    // Initialize addons
    fitAddon.current = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.current.loadAddon(fitAddon.current);
    terminal.current.loadAddon(webLinksAddon);

    // Open terminal in DOM
    terminal.current.open(terminalRef.current);

    // Fit terminal to container
    setTimeout(() => {
      if (fitAddon.current && terminal.current) {
        fitAddon.current.fit();
      }
    }, 0);

    // Connect to WebSocket
    connectToTerminal();

    // Handle terminal input
    terminal.current.onData((data) => {
      if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
        websocket.current.send(JSON.stringify({
          type: 'input',
          data: data
        }));
      }
    });

    // Handle window resize
    const handleResize = () => {
      if (fitAddon.current && terminal.current && !isMinimized) {
        fitAddon.current.fit();
        if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
          websocket.current.send(JSON.stringify({
            type: 'resize',
            cols: terminal.current.cols,
            rows: terminal.current.rows
          }));
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (websocket.current) {
        websocket.current.close();
      }
      if (terminal.current) {
        terminal.current.dispose();
      }
    };
  }, [isMinimized]);

  const connectToTerminal = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    setError('');

    try {
      // Get WebSocket connection info
      const response = await fetch('/api/terminal/websocket');
      if (!response.ok) {
        throw new Error('Failed to get WebSocket info');
      }

      const data = await response.json();
      const wsUrl = data.websocket?.url || 'ws://localhost:3002';

      // Connect to WebSocket
      websocket.current = new WebSocket(wsUrl);

      websocket.current.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);

        if (terminal.current && websocket.current) {
          // Initialize terminal session
          websocket.current.send(JSON.stringify({
            type: 'init',
            cols: terminal.current.cols,
            rows: terminal.current.rows
          }));
        }
      };

      websocket.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case 'session':
              setSessionId(message.sessionId);
              if (terminal.current) {
                terminal.current.write('\r\n\x1b[32mTerminal session started\x1b[0m\r\n');
              }
              break;

            case 'output':
              if (terminal.current) {
                terminal.current.write(message.data);
              }
              break;

            case 'error':
              if (terminal.current) {
                terminal.current.write(`\r\n\x1b[31mError: ${message.message}\x1b[0m\r\n`);
              }
              break;

            case 'exit':
              if (terminal.current) {
                terminal.current.write('\r\n\x1b[33mProcess exited\x1b[0m\r\n');
              }
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      websocket.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        if (terminal.current) {
          terminal.current.write('\r\n\x1b[31mConnection closed\x1b[0m\r\n');
        }
      };

      websocket.current.onerror = (error) => {
        setIsConnected(false);
        setIsConnecting(false);
        setError('WebSocket connection failed');
        if (terminal.current) {
          terminal.current.write('\r\n\x1b[31mConnection error\x1b[0m\r\n');
        }
      };

    } catch (err) {
      setIsConnecting(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
      if (terminal.current) {
        terminal.current.write('\r\n\x1b[31mFailed to connect to terminal\x1b[0m\r\n');
      }
    }
  };

  const reconnect = () => {
    if (websocket.current) {
      websocket.current.close();
    }
    connectToTerminal();
  };

  const clear = () => {
    if (terminal.current) {
      terminal.current.clear();
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${className}`}>
      {/* Terminal Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-300">
              Terminal {sessionId && `(${sessionId.slice(0, 6)})`}
            </span>
          </div>

          {isConnecting && (
            <span className="text-xs text-yellow-500">Connecting...</span>
          )}

          {error && (
            <span className="text-xs text-red-500">{error}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clear}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title="Clear Terminal"
          >
            <RotateCcw size={14} className="text-gray-400" />
          </button>

          {!isConnected && (
            <button
              onClick={reconnect}
              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              disabled={isConnecting}
            >
              {isConnecting ? 'Connecting...' : 'Reconnect'}
            </button>
          )}

          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Minimize"
            >
              <Minimize2 size={14} className="text-gray-400" />
            </button>
          )}

          {onMaximize && (
            <button
              onClick={onMaximize}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? (
                <Square size={14} className="text-gray-400" />
              ) : (
                <Maximize2 size={14} className="text-gray-400" />
              )}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
              title="Close"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Terminal Content */}
      <div className="relative">
        <div
          ref={terminalRef}
          className="h-96 w-full"
          style={{ minHeight: '384px' }}
        />

        {!isConnected && !isConnecting && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Terminal not connected</p>
              <button
                onClick={reconnect}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                Connect Terminal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Return WebSocket connection information
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host');
  const wsProtocol = protocol === 'https' ? 'wss' : 'ws';

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}://${host}/ws/terminal`;

  return NextResponse.json({
    success: true,
    websocket: {
      url: wsUrl,
      port: process.env.WS_PORT || 3002,
      protocol: 'terminal-v1',
      features: [
        'real-time-execution',
        'session-persistence',
        'terminal-resize',
        'ansi-colors',
        'pty-emulation'
      ]
    },
    instructions: {
      connect: `WebSocket connection to ${wsUrl}`,
      messageFormat: {
        init: { type: 'init', cols: 80, rows: 24 },
        input: { type: 'input', data: 'command' },
        resize: { type: 'resize', cols: 100, rows: 30 },
        close: { type: 'close' }
      },
      responseFormat: {
        session: { type: 'session', sessionId: 'xxx' },
        output: { type: 'output', data: 'terminal output' },
        error: { type: 'error', message: 'error message' },
        exit: { type: 'exit' }
      }
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId } = await request.json();

    if (action === 'create') {
      // Return instructions to connect via WebSocket
      return NextResponse.json({
        success: true,
        message: 'Use WebSocket connection for terminal sessions',
        websocket: {
          url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002',
          sessionId: Math.random().toString(36).substring(7)
        }
      });
    }

    if (action === 'status') {
      // Check if WebSocket server is running
      // This would typically check the actual server status
      return NextResponse.json({
        success: true,
        status: 'ready',
        websocketAvailable: true
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Terminal WebSocket endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to process terminal request' },
      { status: 500 }
    );
  }
}
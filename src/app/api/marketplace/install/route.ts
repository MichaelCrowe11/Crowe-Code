import { NextRequest, NextResponse } from 'next/server';
import { croweCodeMarketplace } from '@/lib/marketplace/marketplace-manager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { extensionId, source = 'vscode' } = body;

    if (!extensionId || typeof extensionId !== 'string') {
      return NextResponse.json(
        { error: 'Extension ID is required' },
        { status: 400 }
      );
    }

    if (!['vscode', 'crowecode'].includes(source)) {
      return NextResponse.json(
        { error: 'Invalid source. Must be "vscode" or "crowecode"' },
        { status: 400 }
      );
    }

    // Get user context from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    // Check permissions for premium/enterprise extensions
    // (Implementation would check user subscription level)

    // Install extension
    const result = await croweCodeMarketplace.installExtension(
      extensionId,
      source as 'vscode' | 'crowecode'
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          securityIssues: result.securityIssues,
          compatibilityIssues: result.compatibilityIssues
        },
        { status: 400 }
      );
    }

    // Log installation for analytics
    console.log(`Extension ${extensionId} installed by user ${userId}`);

    return NextResponse.json({
      success: true,
      message: `Extension ${extensionId} installed successfully`,
      extension: result.extension?.metadata,
      activationRequired: result.activationRequired
    });

  } catch (error) {
    console.error('Extension installation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to install extension',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get installed extensions
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    // This would typically fetch from database
    // For now, return a mock response showing the concept
    const installedExtensions = [
      {
        id: 'ms-python.python',
        name: 'Python',
        displayName: 'Python',
        version: '2024.0.0',
        publisher: 'Microsoft',
        category: 'languages',
        installedAt: new Date().toISOString()
      },
      {
        id: 'esbenp.prettier-vscode',
        name: 'prettier-vscode',
        displayName: 'Prettier - Code formatter',
        version: '10.1.0',
        publisher: 'Prettier',
        category: 'formatters',
        installedAt: new Date().toISOString()
      },
      {
        id: 'github.copilot',
        name: 'copilot',
        displayName: 'GitHub Copilot',
        version: '1.150.0',
        publisher: 'GitHub',
        category: 'ai-assistants',
        installedAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      userId,
      count: installedExtensions.length,
      extensions: installedExtensions
    });

  } catch (error) {
    console.error('Failed to fetch installed extensions:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch installed extensions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
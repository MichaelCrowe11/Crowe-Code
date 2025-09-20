import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate onboarding data
    if (!body.account || !body.profile || !body.domain) {
      return NextResponse.json(
        { success: false, error: 'Incomplete onboarding data' },
        { status: 400 }
      );
    }

    // Mock user creation (in real implementation, save to database)
    const userData = {
      id: `user_${Date.now()}`,
      account: {
        name: body.account.name,
        email: body.account.email,
        role: body.account.role,
        organization: body.account.organization
      },
      profile: {
        experience: body.profile.experience,
        interests: body.profile.interests || [],
        goals: body.profile.goals || []
      },
      domain: {
        primary: body.domain.primary,
        secondary: body.domain.secondary || [],
        useCase: body.domain.useCase
      },
      workspace: body.workspace || {
        name: 'My Workspace',
        type: 'personal',
        features: []
      },
      onboardingCompleted: true,
      createdAt: new Date().toISOString()
    };

    // Mock workspace setup based on domain selection
    const workspaceConfig = {
      agriculture: {
        defaultPages: ['/dashboard/agriculture', '/sensors', '/analytics'],
        enabledFeatures: ['iot-sensors', 'crop-monitoring', 'weather-integration'],
        sampleData: 'agriculture-demo'
      },
      mycology: {
        defaultPages: ['/dashboard/mycology', '/strains', '/protocols'],
        enabledFeatures: ['strain-tracking', 'contamination-detection', 'protocol-management'],
        sampleData: 'mycology-demo'
      },
      coding: {
        defaultPages: ['/dashboard/coding', '/projects', '/ai-assistant'],
        enabledFeatures: ['code-completion', 'ai-review', 'project-management'],
        sampleData: 'coding-demo'
      },
      general: {
        defaultPages: ['/dashboard', '/features', '/community'],
        enabledFeatures: ['all-features'],
        sampleData: 'general-demo'
      }
    };

    const domainConfig = workspaceConfig[body.domain.primary as keyof typeof workspaceConfig] || workspaceConfig.general;

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        workspace: {
          ...userData.workspace,
          config: domainConfig
        },
        redirectUrl: domainConfig.defaultPages[0] || '/dashboard'
      },
      message: 'Onboarding completed successfully'
    });

  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Mock getting onboarding status (in real implementation, fetch from database)
    const onboardingStatus = {
      userId,
      completed: true,
      steps: {
        welcome: true,
        account: true,
        profile: true,
        domain: true,
        demo: false,
        workspace: true
      },
      progress: 83, // 5/6 steps completed
      completedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: onboardingStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch onboarding status' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import logger from '../../../../lib/logger';

export async function GET(req: NextRequest) {
  try {
    // Only allow in development or with a secret key
    const setupKey = req.nextUrl.searchParams.get('key');
    if (setupKey !== 'setup-crowecode-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_FIRST_20: process.env.DATABASE_URL?.substring(0, 20) || 'N/A',
      REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      // Don't expose actual secrets, just existence
      secretsStatus: {
        ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
        XAI_API_KEY: !!process.env.XAI_API_KEY
      }
    };

    return NextResponse.json({
      success: true,
      env: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logger.error('Error checking environment:', error);
    return NextResponse.json({
      error: 'Failed to check environment',
      details: error.message
    }, { status: 500 });
  }
}
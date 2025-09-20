import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Check environment variables (without exposing secrets)
  const config = {
    nextauth: {
      url: process.env.NEXTAUTH_URL || 'NOT SET',
      secret: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || 'NOT SET',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ? 'SET' : 'NOT SET',
      callbackUrl: `${process.env.NEXTAUTH_URL || 'https://crowecode-main.fly.dev'}/api/auth/callback/github`,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'NOT SET',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET',
      callbackUrl: `${process.env.NEXTAUTH_URL || 'https://crowecode-main.fly.dev'}/api/auth/callback/google`,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      platform: process.env.FLY_APP_NAME ? 'Fly.io' : 'Unknown',
    },
  };

  return NextResponse.json({
    message: 'OAuth Debug Information',
    config,
    instructions: {
      github: {
        step1: 'Go to https://github.com/settings/developers',
        step2: 'Click on your OAuth App',
        step3: 'Verify Authorization callback URL is EXACTLY:',
        callbackUrl: config.github.callbackUrl,
        step4: 'No trailing slashes, must match exactly',
      },
      google: {
        step1: 'Go to Google Cloud Console',
        step2: 'Check OAuth 2.0 Client IDs',
        step3: 'Verify Authorized redirect URI is EXACTLY:',
        callbackUrl: config.google.callbackUrl,
      },
    },
    testUrls: {
      providers: '/api/auth/providers',
      csrf: '/api/auth/csrf',
      session: '/api/auth/session',
      signInPage: '/api/auth/signin',
      githubSignIn: '/api/auth/signin/github',
      googleSignIn: '/api/auth/signin/google',
    },
  });
}
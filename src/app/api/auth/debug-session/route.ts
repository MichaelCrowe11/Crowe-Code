import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const primaryCookie = process.env.NODE_ENV === 'production'
    ? '__Secure-next-auth.session-token'
    : 'next-auth.session-token';

  let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, cookieName: primaryCookie });
  if (!token) {
    token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  }

  return NextResponse.json({
    hasToken: !!token,
    tokenPreview: token ? { sub: token.sub, email: token.email, name: token.name, role: (token as any).role } : null,
    cookieTried: primaryCookie,
    nextauthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: process.env.NODE_ENV,
  });
}

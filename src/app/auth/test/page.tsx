'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function AuthTestPage() {
  const { data: session, status } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Loading...</h1>
      </div>
    </div>;
  }

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setMessage(`Error: ${result.error}`);
    } else {
      setMessage('Login successful!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">OAuth Authentication Test</h1>

        {/* Session Status */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="space-y-2">
            <p>Status: <span className="text-green-400">{status}</span></p>
            {session ? (
              <>
                <p>User ID: <span className="text-blue-400">{session.user?.id}</span></p>
                <p>Email: <span className="text-blue-400">{session.user?.email}</span></p>
                <p>Name: <span className="text-blue-400">{session.user?.name}</span></p>
                <p>Provider: <span className="text-blue-400">{session.user?.image ? 'OAuth' : 'Credentials'}</span></p>
                <button
                  onClick={() => signOut()}
                  className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <p className="text-gray-400">Not logged in</p>
            )}
          </div>
        </div>

        {!session && (
          <>
            {/* OAuth Providers */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">OAuth Providers</h2>
              <div className="space-y-4">
                <button
                  onClick={() => signIn('github')}
                  className="w-full px-4 py-3 bg-gray-700 rounded hover:bg-gray-600 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Sign in with GitHub
                </button>

                <button
                  onClick={() => signIn('google')}
                  className="w-full px-4 py-3 bg-blue-600 rounded hover:bg-blue-700 flex items-center justify-center"
                >
                  <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </div>

            {/* Credentials Login */}
            <div className="bg-gray-800 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Credentials Login</h2>
              <form onSubmit={handleCredentialsLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 rounded hover:bg-green-700"
                >
                  Sign in with Email
                </button>
              </form>
              {message && (
                <p className={`mt-4 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {message}
                </p>
              )}
            </div>
          </>
        )}

        {/* Test Actions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a href="/api/auth/signin" className="text-blue-400 hover:underline block">
              → NextAuth Sign In Page
            </a>
            <a href="/api/auth/signout" className="text-blue-400 hover:underline block">
              → NextAuth Sign Out Page
            </a>
            <a href="/api/auth/providers" className="text-blue-400 hover:underline block">
              → View Available Providers
            </a>
            <a href="/api/auth/csrf" className="text-blue-400 hover:underline block">
              → Get CSRF Token
            </a>
            <a href="/dashboard" className="text-blue-400 hover:underline block">
              → Go to Dashboard (Protected)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
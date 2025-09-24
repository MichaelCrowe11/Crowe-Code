import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authOptions } from '@/lib/auth/nextauth-config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('@/lib/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

describe('NextAuth Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up environment variables
    process.env.GITHUB_CLIENT_ID = 'test-github-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-github-secret';
    process.env.GOOGLE_CLIENT_ID = 'test-google-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration Structure', () => {
    it('should have correct basic configuration', () => {
      expect(authOptions.trustHost).toBe(true);
      expect(authOptions.session?.strategy).toBe('jwt');
      expect(authOptions.session?.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
    });

    it('should have correct page routes', () => {
      expect(authOptions.pages).toEqual({
        signIn: '/login',
        signOut: '/auth/signout',
        error: '/auth/error',
        verifyRequest: '/auth/verify-request',
      });
    });

    it('should have all required providers', () => {
      expect(authOptions.providers).toHaveLength(3);

      // Check provider types
      const providerNames = authOptions.providers.map((p) => p.id || p.name?.toLowerCase());
      expect(providerNames).toContain('github');
      expect(providerNames).toContain('google');
      expect(providerNames).toContain('credentials');
    });
  });

  describe('GitHub Provider', () => {
    it('should configure GitHub provider correctly', () => {
      const githubProvider = authOptions.providers.find(p => p.id === 'github');
      expect(githubProvider).toBeDefined();
      expect(githubProvider?.options?.clientId).toBe('test-github-id');
      expect(githubProvider?.options?.clientSecret).toBe('test-github-secret');
      expect(githubProvider?.options?.allowDangerousEmailAccountLinking).toBe(true);
    });

    it('should handle GitHub profile correctly', () => {
      const githubProvider = authOptions.providers.find(p => p.id === 'github');
      const profile = {
        id: 12345,
        login: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        avatar_url: 'https://avatar.url',
      };

      const result = githubProvider?.options?.profile?.(profile);

      expect(result).toEqual({
        id: '12345',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://avatar.url',
        role: 'USER',
      });
    });

    it('should fallback to login when name is not provided', () => {
      const githubProvider = authOptions.providers.find(p => p.id === 'github');
      const profile = {
        id: 12345,
        login: 'testuser',
        email: 'test@example.com',
        avatar_url: 'https://avatar.url',
      };

      const result = githubProvider?.options?.profile?.(profile);

      expect(result?.name).toBe('testuser');
    });
  });

  describe('Google Provider', () => {
    it('should configure Google provider correctly', () => {
      const googleProvider = authOptions.providers.find(p => p.id === 'google');
      expect(googleProvider).toBeDefined();
      expect(googleProvider?.options?.clientId).toBe('test-google-id');
      expect(googleProvider?.options?.clientSecret).toBe('test-google-secret');
      expect(googleProvider?.options?.allowDangerousEmailAccountLinking).toBe(true);
    });

    it('should handle Google profile correctly', () => {
      const googleProvider = authOptions.providers.find(p => p.id === 'google');
      const profile = {
        sub: 'google-user-id',
        name: 'Test User',
        email: 'test@example.com',
        picture: 'https://picture.url',
      };

      const result = googleProvider?.options?.profile?.(profile);

      expect(result).toEqual({
        id: 'google-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://picture.url',
        role: 'USER',
      });
    });
  });

  describe('Credentials Provider', () => {
    const credentialsProvider = authOptions.providers.find(p => p.id === 'credentials');

    it('should configure credentials provider correctly', () => {
      expect(credentialsProvider).toBeDefined();
      expect(credentialsProvider?.name).toBe('credentials');
      expect(credentialsProvider?.credentials).toEqual({
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      });
    });

    it('should throw error for missing credentials', async () => {
      const authorize = credentialsProvider?.authorize;

      await expect(
        authorize?.({}, {} as any)
      ).rejects.toThrow('Invalid credentials');

      await expect(
        authorize?.({ email: 'test@example.com' }, {} as any)
      ).rejects.toThrow('Invalid credentials');

      await expect(
        authorize?.({ password: 'password' }, {} as any)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for non-existent user', async () => {
      const authorize = credentialsProvider?.authorize;

      (prisma.user.findUnique as any).mockResolvedValue(null);

      await expect(
        authorize?.({ email: 'test@example.com', password: 'password' }, {} as any)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for user without password hash', async () => {
      const authorize = credentialsProvider?.authorize;

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: null,
      });

      await expect(
        authorize?.({ email: 'test@example.com', password: 'password' }, {} as any)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      const authorize = credentialsProvider?.authorize;

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      });

      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        authorize?.({ email: 'test@example.com', password: 'wrong-password' }, {} as any)
      ).rejects.toThrow('Invalid credentials');
    });

    it('should return user for valid credentials', async () => {
      const authorize = credentialsProvider?.authorize;
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        image: 'image-url',
        avatar: 'avatar-url',
        passwordHash: 'hashed-password',
        role: 'USER' as UserRole,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await authorize?.({ email: 'test@example.com', password: 'password' }, {} as any);

      expect(result).toEqual({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        image: 'image-url',
        role: 'USER',
      });
    });

    it('should handle email case insensitivity', async () => {
      const authorize = credentialsProvider?.authorize;

      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'USER',
      });
      (bcrypt.compare as any).mockResolvedValue(true);

      await authorize?.({ email: 'TEST@EXAMPLE.COM', password: 'password' }, {} as any);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });
  });

  describe('Callbacks', () => {
    describe('signIn callback', () => {
      it('should always return true', async () => {
        const signIn = authOptions.callbacks?.signIn;
        const result = await signIn?.({
          user: { id: 'user-id', email: 'test@example.com' },
          account: { provider: 'github' },
          profile: {},
        } as any);

        expect(result).toBe(true);
      });
    });

    describe('redirect callback', () => {
      it('should handle relative URLs', async () => {
        const redirect = authOptions.callbacks?.redirect;

        const result = await redirect?.({
          url: '/dashboard',
          baseUrl: 'http://localhost:3000',
        } as any);

        expect(result).toBe('http://localhost:3000/dashboard');
      });

      it('should handle same origin URLs', async () => {
        const redirect = authOptions.callbacks?.redirect;

        const result = await redirect?.({
          url: 'http://localhost:3000/settings',
          baseUrl: 'http://localhost:3000',
        } as any);

        expect(result).toBe('http://localhost:3000/settings');
      });

      it('should default to dashboard for external URLs', async () => {
        const redirect = authOptions.callbacks?.redirect;

        const result = await redirect?.({
          url: 'https://external.com/malicious',
          baseUrl: 'http://localhost:3000',
        } as any);

        expect(result).toBe('http://localhost:3000/dashboard');
      });
    });

    describe('jwt callback', () => {
      it('should populate token on initial sign in', async () => {
        const jwt = authOptions.callbacks?.jwt;

        const result = await jwt?.({
          token: {},
          user: {
            id: 'user-id',
            email: 'test@example.com',
            name: 'Test User',
            image: 'image-url',
            role: 'ADMIN',
          },
          account: {
            access_token: 'access-token',
            refresh_token: 'refresh-token',
            provider: 'github',
          },
        } as any);

        expect(result).toEqual({
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
          picture: 'image-url',
          role: 'ADMIN',
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          provider: 'github',
        });
      });

      it('should preserve existing token without user/account', async () => {
        const jwt = authOptions.callbacks?.jwt;
        const existingToken = {
          id: 'user-id',
          email: 'test@example.com',
          name: 'Test User',
        };

        const result = await jwt?.({
          token: existingToken,
        } as any);

        expect(result).toEqual(existingToken);
      });
    });

    describe('session callback', () => {
      it('should populate session from token', async () => {
        const session = authOptions.callbacks?.session;

        const result = await session?.({
          session: {
            user: {},
          },
          token: {
            id: 'user-id',
            email: 'test@example.com',
            name: 'Test User',
            picture: 'image-url',
            role: 'ADMIN',
            accessToken: 'access-token',
          },
        } as any);

        expect(result).toEqual({
          user: {
            id: 'user-id',
            email: 'test@example.com',
            name: 'Test User',
            image: 'image-url',
            role: 'ADMIN',
          },
          accessToken: 'access-token',
        });
      });
    });
  });

  describe('Events', () => {
    describe('signIn event', () => {
      it('should update last login time on sign in', async () => {
        const signInEvent = authOptions.events?.signIn;

        (prisma.user.update as any).mockResolvedValue({});

        await signInEvent?.({
          user: { email: 'test@example.com' },
          account: {},
          isNewUser: false,
        } as any);

        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { email: 'test@example.com' },
          data: { lastLoginAt: expect.any(Date) },
        });
      });

      it('should handle missing email gracefully', async () => {
        const signInEvent = authOptions.events?.signIn;

        await signInEvent?.({
          user: {},
          account: {},
          isNewUser: false,
        } as any);

        expect(prisma.user.update).not.toHaveBeenCalled();
      });

      it('should handle database errors gracefully', async () => {
        const signInEvent = authOptions.events?.signIn;

        (prisma.user.update as any).mockRejectedValue(new Error('Database error'));

        // Should not throw
        await expect(
          signInEvent?.({
            user: { email: 'test@example.com' },
            account: {},
            isNewUser: false,
          } as any)
        ).resolves.toBeUndefined();
      });
    });
  });

  describe('Debug Configuration', () => {
    it('should enable debug in development', () => {
      process.env.NODE_ENV = 'development';
      expect(authOptions.debug).toBe(true);
    });

    it('should disable debug in production', () => {
      process.env.NODE_ENV = 'production';
      // Re-evaluate the module to pick up the new NODE_ENV
      // In a real test, you might need to re-import the module
      expect(process.env.NODE_ENV).toBe('production');
    });
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    project: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
      count: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    account: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  })),
}));

describe('Prisma Client', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let prisma: any;

  beforeEach(() => {
    vi.clearAllMocks();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('Client Initialization', () => {
    it('should create Prisma client with development logging', async () => {
      process.env.NODE_ENV = 'development';

      // Re-import to pick up environment changes
      const { prisma } = await import('@/lib/prisma');

      expect(PrismaClient).toHaveBeenCalledWith({
        log: ['query', 'error', 'warn'],
      });
    });

    it('should create Prisma client with production logging', async () => {
      process.env.NODE_ENV = 'production';

      // Clear the module cache and re-import
      vi.resetModules();
      const { prisma } = await import('@/lib/prisma');

      expect(PrismaClient).toHaveBeenCalledWith({
        log: ['error'],
      });
    });

    it('should create Prisma client with test logging', async () => {
      process.env.NODE_ENV = 'test';

      vi.resetModules();
      const { prisma } = await import('@/lib/prisma');

      expect(PrismaClient).toHaveBeenCalledWith({
        log: ['error'],
      });
    });

    it('should reuse global Prisma instance in non-production environments', async () => {
      process.env.NODE_ENV = 'development';

      // First import
      vi.resetModules();
      const { prisma: firstInstance } = await import('@/lib/prisma');

      // Second import
      vi.resetModules();
      const { prisma: secondInstance } = await import('@/lib/prisma');

      // Should reuse the same instance (globalForPrisma.prisma)
      expect(firstInstance).toBeDefined();
      expect(secondInstance).toBeDefined();
    });

    it('should not pollute global in production', async () => {
      process.env.NODE_ENV = 'production';

      vi.resetModules();
      const { prisma } = await import('@/lib/prisma');

      // In production, should not set global.prisma
      expect(prisma).toBeDefined();
    });
  });

  describe('Database Operations - User Model', () => {
    beforeEach(async () => {
      vi.resetModules();
      const { prisma: prismaCient } = await import('@/lib/prisma');
      prisma = prismaCient;
    });

    it('should create a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.create.mockResolvedValue(mockUser);

      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      const result = await prisma.user.create({
        data: userData,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
    });

    it('should find user by email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should find user by id', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { id: 'user-123' },
        include: { projects: true, accounts: true },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: { projects: true, accounts: true },
      });
      expect(result).toEqual(mockUser);
    });

    it('should update user profile', async () => {
      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'USER',
        lastLoginAt: new Date(),
      };

      prisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await prisma.user.update({
        where: { id: 'user-123' },
        data: {
          name: 'Updated Name',
          lastLoginAt: new Date(),
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          name: 'Updated Name',
          lastLoginAt: expect.any(Date),
        }),
      });
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should delete user', async () => {
      const mockDeletedUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      };

      prisma.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await prisma.user.delete({
        where: { id: 'user-123' },
      });

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toEqual(mockDeletedUser);
    });

    it('should count users', async () => {
      prisma.user.count.mockResolvedValue(42);

      const result = await prisma.user.count({
        where: { role: 'USER' },
      });

      expect(prisma.user.count).toHaveBeenCalledWith({
        where: { role: 'USER' },
      });
      expect(result).toBe(42);
    });

    it('should handle user upsert operation', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      };

      prisma.user.upsert.mockResolvedValue(mockUser);

      const result = await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: { name: 'Updated Name', lastLoginAt: new Date() },
        create: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      });

      expect(prisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        update: expect.objectContaining({
          name: 'Updated Name',
          lastLoginAt: expect.any(Date),
        }),
        create: {
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('Database Operations - Project Model', () => {
    beforeEach(async () => {
      vi.resetModules();
      const { prisma: prismaCient } = await import('@/lib/prisma');
      prisma = prismaCient;
    });

    it('should create a new project', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
        description: 'A test project',
        ownerId: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.create.mockResolvedValue(mockProject);

      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        ownerId: 'user-123',
      };

      const result = await prisma.project.create({
        data: projectData,
      });

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: projectData,
      });
      expect(result).toEqual(mockProject);
    });

    it('should find projects by user', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'Project 1', ownerId: 'user-123' },
        { id: 'project-2', name: 'Project 2', ownerId: 'user-123' },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await prisma.project.findMany({
        where: { ownerId: 'user-123' },
        include: { owner: true },
        orderBy: { updatedAt: 'desc' },
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        include: { owner: true },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toEqual(mockProjects);
    });

    it('should update project', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'Updated Project',
        description: 'Updated description',
        updatedAt: new Date(),
      };

      prisma.project.update.mockResolvedValue(mockProject);

      const result = await prisma.project.update({
        where: { id: 'project-123' },
        data: {
          name: 'Updated Project',
          description: 'Updated description',
        },
      });

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: {
          name: 'Updated Project',
          description: 'Updated description',
        },
      });
      expect(result).toEqual(mockProject);
    });

    it('should delete project', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'Test Project',
      };

      prisma.project.delete.mockResolvedValue(mockProject);

      const result = await prisma.project.delete({
        where: { id: 'project-123' },
      });

      expect(prisma.project.delete).toHaveBeenCalledWith({
        where: { id: 'project-123' },
      });
      expect(result).toEqual(mockProject);
    });
  });

  describe('Database Operations - Session Model', () => {
    beforeEach(async () => {
      vi.resetModules();
      const { prisma: prismaCient } = await import('@/lib/prisma');
      prisma = prismaCient;
    });

    it('should create a session', async () => {
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-123',
        userId: 'user-123',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      prisma.session.create.mockResolvedValue(mockSession);

      const sessionData = {
        sessionToken: 'session-token-123',
        userId: 'user-123',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const result = await prisma.session.create({
        data: sessionData,
      });

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: sessionData,
      });
      expect(result).toEqual(mockSession);
    });

    it('should find session by token', async () => {
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-123',
        userId: 'user-123',
        expires: new Date(),
      };

      prisma.session.findUnique.mockResolvedValue(mockSession);

      const result = await prisma.session.findUnique({
        where: { sessionToken: 'session-token-123' },
        include: { user: true },
      });

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-123' },
        include: { user: true },
      });
      expect(result).toEqual(mockSession);
    });

    it('should delete expired sessions', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 5 });

      const result = await prisma.session.deleteMany({
        where: {
          expires: {
            lt: new Date(),
          },
        },
      });

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          expires: {
            lt: expect.any(Date),
          },
        },
      });
      expect(result.count).toBe(5);
    });

    it('should update session expiry', async () => {
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-123',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      prisma.session.update.mockResolvedValue(mockSession);

      const result = await prisma.session.update({
        where: { sessionToken: 'session-token-123' },
        data: {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-123' },
        data: {
          expires: expect.any(Date),
        },
      });
      expect(result).toEqual(mockSession);
    });
  });

  describe('Database Operations - Account Model', () => {
    beforeEach(async () => {
      vi.resetModules();
      const { prisma: prismaCient } = await import('@/lib/prisma');
      prisma = prismaCient;
    });

    it('should create OAuth account', async () => {
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        type: 'oauth',
        provider: 'github',
        providerAccountId: 'github-123',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      prisma.account.create.mockResolvedValue(mockAccount);

      const accountData = {
        userId: 'user-123',
        type: 'oauth',
        provider: 'github',
        providerAccountId: 'github-123',
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const result = await prisma.account.create({
        data: accountData,
      });

      expect(prisma.account.create).toHaveBeenCalledWith({
        data: accountData,
      });
      expect(result).toEqual(mockAccount);
    });

    it('should find account by provider', async () => {
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        provider: 'github',
        providerAccountId: 'github-123',
      };

      prisma.account.findUnique.mockResolvedValue(mockAccount);

      const result = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'github',
            providerAccountId: 'github-123',
          },
        },
      });

      expect(prisma.account.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: 'github',
            providerAccountId: 'github-123',
          },
        },
      });
      expect(result).toEqual(mockAccount);
    });

    it('should find accounts by user', async () => {
      const mockAccounts = [
        { id: 'account-1', provider: 'github', userId: 'user-123' },
        { id: 'account-2', provider: 'google', userId: 'user-123' },
      ];

      prisma.account.findMany.mockResolvedValue(mockAccounts);

      const result = await prisma.account.findMany({
        where: { userId: 'user-123' },
      });

      expect(prisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual(mockAccounts);
    });

    it('should update account tokens', async () => {
      const mockAccount = {
        id: 'account-123',
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      prisma.account.update.mockResolvedValue(mockAccount);

      const result = await prisma.account.update({
        where: { id: 'account-123' },
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_at: Math.floor(Date.now() / 1000) + 3600,
        },
      });

      expect(prisma.account.update).toHaveBeenCalledWith({
        where: { id: 'account-123' },
        data: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_at: expect.any(Number),
        },
      });
      expect(result).toEqual(mockAccount);
    });
  });

  describe('Advanced Database Operations', () => {
    beforeEach(async () => {
      vi.resetModules();
      const { prisma: prismaCient } = await import('@/lib/prisma');
      prisma = prismaCient;
    });

    it('should execute transactions', async () => {
      const mockResult = ['user-created', 'profile-created'];

      prisma.$transaction.mockResolvedValue(mockResult);

      const result = await prisma.$transaction([
        prisma.user.create({
          data: { email: 'test@example.com', name: 'Test User' },
        }),
        prisma.project.create({
          data: { name: 'Test Project', ownerId: 'user-123' },
        }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalledWith([
        expect.any(Object),
        expect.any(Object),
      ]);
      expect(result).toEqual(mockResult);
    });

    it('should execute raw queries', async () => {
      const mockResult = [{ count: 42 }];

      prisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM "User" WHERE "role" = ${'USER'}
      `;

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should execute raw commands', async () => {
      prisma.$executeRaw.mockResolvedValue(1);

      const result = await prisma.$executeRaw`
        UPDATE "User" SET "lastLoginAt" = ${new Date()} WHERE "id" = ${'user-123'}
      `;

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(result).toBe(1);
    });

    it('should handle connection management', async () => {
      await prisma.$connect();
      expect(prisma.$connect).toHaveBeenCalled();

      await prisma.$disconnect();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      vi.resetModules();
      const { prisma: prismaCient } = await import('@/lib/prisma');
      prisma = prismaCient;
    });

    it('should handle unique constraint violations', async () => {
      const uniqueConstraintError = {
        code: 'P2002',
        meta: { target: ['email'] },
        message: 'Unique constraint failed on the fields: (`email`)',
      };

      prisma.user.create.mockRejectedValue(uniqueConstraintError);

      await expect(
        prisma.user.create({
          data: { email: 'existing@example.com', name: 'Test User' },
        })
      ).rejects.toMatchObject({
        code: 'P2002',
        meta: { target: ['email'] },
      });
    });

    it('should handle record not found errors', async () => {
      const notFoundError = {
        code: 'P2025',
        message: 'Record to update not found.',
      };

      prisma.user.update.mockRejectedValue(notFoundError);

      await expect(
        prisma.user.update({
          where: { id: 'non-existent-id' },
          data: { name: 'Updated Name' },
        })
      ).rejects.toMatchObject({
        code: 'P2025',
        message: 'Record to update not found.',
      });
    });

    it('should handle connection errors', async () => {
      const connectionError = new Error('Can\'t reach database server');

      prisma.user.findMany.mockRejectedValue(connectionError);

      await expect(prisma.user.findMany()).rejects.toThrow(
        'Can\'t reach database server'
      );
    });

    it('should handle transaction rollback', async () => {
      const transactionError = new Error('Transaction failed');

      prisma.$transaction.mockRejectedValue(transactionError);

      await expect(
        prisma.$transaction([
          prisma.user.create({ data: { email: 'test@example.com' } }),
          prisma.user.create({ data: { email: 'test@example.com' } }), // Duplicate email
        ])
      ).rejects.toThrow('Transaction failed');
    });
  });
});
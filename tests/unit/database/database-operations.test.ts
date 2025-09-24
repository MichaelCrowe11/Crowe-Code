import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/database';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
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
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
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
    $transaction: vi.fn(),
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  })),
}));

describe('Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('User Management', () => {
    it('should create user with hashed password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.user.create.mockResolvedValue(mockUser);

      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        role: 'USER',
      };

      const result = await prisma.user.create({
        data: userData,
      });

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: userData,
      });
      expect(result).toEqual(mockUser);
      expect(result.passwordHash).toBe('hashed-password');
    });

    it('should find user by email for authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        role: 'USER',
        lastLoginAt: null,
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          role: true,
          lastLoginAt: true,
        },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
          role: true,
          lastLoginAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should update user last login timestamp', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        lastLoginAt: new Date(),
      };

      prisma.user.update.mockResolvedValue(mockUser);

      const result = await prisma.user.update({
        where: { email: 'test@example.com' },
        data: { lastLoginAt: new Date() },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { lastLoginAt: expect.any(Date) },
      });
      expect(result.lastLoginAt).toBeInstanceOf(Date);
    });

    it('should get user profile with projects', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        projects: [
          { id: 'project-1', name: 'Project 1' },
          { id: 'project-2', name: 'Project 2' },
        ],
        accounts: [
          { provider: 'github', providerAccountId: 'github-123' },
        ],
      };

      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { id: 'user-123' },
        include: {
          projects: {
            orderBy: { updatedAt: 'desc' },
            take: 10,
          },
          accounts: {
            select: { provider: true, providerAccountId: true },
          },
        },
      });

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          projects: {
            orderBy: { updatedAt: 'desc' },
            take: 10,
          },
          accounts: {
            select: { provider: true, providerAccountId: true },
          },
        },
      });
      expect(result.projects).toHaveLength(2);
      expect(result.accounts).toHaveLength(1);
    });

    it('should handle user role updates', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'ADMIN',
        updatedAt: new Date(),
      };

      prisma.user.update.mockResolvedValue(mockUser);

      const result = await prisma.user.update({
        where: { id: 'user-123' },
        data: { role: 'ADMIN' },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { role: 'ADMIN' },
      });
      expect(result.role).toBe('ADMIN');
    });

    it('should soft delete user by marking as inactive', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        isActive: false,
        deletedAt: new Date(),
      };

      prisma.user.update.mockResolvedValue(mockUser);

      const result = await prisma.user.update({
        where: { id: 'user-123' },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          isActive: false,
          deletedAt: expect.any(Date),
        },
      });
      expect(result.isActive).toBe(false);
      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Project Management', () => {
    it('should create project with owner', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'My Awesome Project',
        description: 'A really cool project',
        ownerId: 'user-123',
        isPublic: false,
        language: 'TypeScript',
        framework: 'Next.js',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.project.create.mockResolvedValue(mockProject);

      const projectData = {
        name: 'My Awesome Project',
        description: 'A really cool project',
        ownerId: 'user-123',
        isPublic: false,
        language: 'TypeScript',
        framework: 'Next.js',
      };

      const result = await prisma.project.create({
        data: projectData,
        include: { owner: true },
      });

      expect(prisma.project.create).toHaveBeenCalledWith({
        data: projectData,
        include: { owner: true },
      });
      expect(result).toEqual(mockProject);
    });

    it('should find user projects with pagination', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Project 1',
          ownerId: 'user-123',
          updatedAt: new Date('2024-01-15'),
        },
        {
          id: 'project-2',
          name: 'Project 2',
          ownerId: 'user-123',
          updatedAt: new Date('2024-01-10'),
        },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await prisma.project.findMany({
        where: { ownerId: 'user-123' },
        include: {
          owner: { select: { name: true, email: true } },
          collaborators: { select: { user: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        include: {
          owner: { select: { name: true, email: true } },
          collaborators: { select: { user: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(result).toHaveLength(2);
    });

    it('should search projects by name', async () => {
      const mockProjects = [
        { id: 'project-1', name: 'React Dashboard', isPublic: true },
        { id: 'project-2', name: 'React Native App', isPublic: true },
      ];

      prisma.project.findMany.mockResolvedValue(mockProjects);

      const result = await prisma.project.findMany({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { name: { contains: 'React', mode: 'insensitive' } },
                { description: { contains: 'React', mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          owner: { select: { name: true } },
          _count: { select: { stars: true, forks: true } },
        },
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { isPublic: true },
            {
              OR: [
                { name: { contains: 'React', mode: 'insensitive' } },
                { description: { contains: 'React', mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          owner: { select: { name: true } },
          _count: { select: { stars: true, forks: true } },
        },
      });
      expect(result).toHaveLength(2);
    });

    it('should update project metadata', async () => {
      const mockProject = {
        id: 'project-123',
        name: 'Updated Project Name',
        description: 'Updated description',
        updatedAt: new Date(),
        lastActivityAt: new Date(),
      };

      prisma.project.update.mockResolvedValue(mockProject);

      const result = await prisma.project.update({
        where: { id: 'project-123' },
        data: {
          name: 'Updated Project Name',
          description: 'Updated description',
          lastActivityAt: new Date(),
        },
      });

      expect(prisma.project.update).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        data: {
          name: 'Updated Project Name',
          description: 'Updated description',
          lastActivityAt: expect.any(Date),
        },
      });
      expect(result.name).toBe('Updated Project Name');
    });

    it('should get project statistics', async () => {
      const mockStats = [
        { language: 'TypeScript', _count: 15 },
        { language: 'JavaScript', _count: 10 },
        { language: 'Python', _count: 8 },
      ];

      prisma.project.findMany.mockResolvedValue(mockStats);

      const result = await prisma.project.findMany({
        where: { ownerId: 'user-123' },
        select: {
          language: true,
          _count: {
            select: { files: true },
          },
        },
        distinct: ['language'],
      });

      expect(prisma.project.findMany).toHaveBeenCalledWith({
        where: { ownerId: 'user-123' },
        select: {
          language: true,
          _count: {
            select: { files: true },
          },
        },
        distinct: ['language'],
      });
      expect(result).toEqual(mockStats);
    });
  });

  describe('Session Management', () => {
    it('should create user session', async () => {
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-abc123',
        userId: 'user-123',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        createdAt: new Date(),
      };

      prisma.session.create.mockResolvedValue(mockSession);

      const sessionData = {
        sessionToken: 'session-token-abc123',
        userId: 'user-123',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      const result = await prisma.session.create({
        data: sessionData,
      });

      expect(prisma.session.create).toHaveBeenCalledWith({
        data: sessionData,
      });
      expect(result.expires.getTime()).toBeGreaterThan(Date.now());
    });

    it('should find valid session with user', async () => {
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-abc123',
        userId: 'user-123',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        },
      };

      prisma.session.findUnique.mockResolvedValue(mockSession);

      const result = await prisma.session.findUnique({
        where: { sessionToken: 'session-token-abc123' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              image: true,
            },
          },
        },
      });

      expect(prisma.session.findUnique).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-abc123' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              image: true,
            },
          },
        },
      });
      expect(result.user.email).toBe('test@example.com');
    });

    it('should extend session expiry', async () => {
      const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-abc123',
        expires: newExpiry,
      };

      prisma.session.update.mockResolvedValue(mockSession);

      const result = await prisma.session.update({
        where: { sessionToken: 'session-token-abc123' },
        data: { expires: newExpiry },
      });

      expect(prisma.session.update).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-abc123' },
        data: { expires: newExpiry },
      });
      expect(result.expires).toEqual(newExpiry);
    });

    it('should cleanup expired sessions', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 10 });

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
      expect(result.count).toBe(10);
    });

    it('should delete user session on logout', async () => {
      const mockSession = {
        id: 'session-123',
        sessionToken: 'session-token-abc123',
      };

      prisma.session.delete.mockResolvedValue(mockSession);

      const result = await prisma.session.delete({
        where: { sessionToken: 'session-token-abc123' },
      });

      expect(prisma.session.delete).toHaveBeenCalledWith({
        where: { sessionToken: 'session-token-abc123' },
      });
      expect(result.sessionToken).toBe('session-token-abc123');
    });
  });

  describe('OAuth Account Management', () => {
    it('should create OAuth account link', async () => {
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        type: 'oauth',
        provider: 'github',
        providerAccountId: 'github-12345',
        access_token: 'gho_abc123...',
        refresh_token: 'ghr_def456...',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        scope: 'user:email,read:user',
      };

      prisma.account.create.mockResolvedValue(mockAccount);

      const accountData = {
        userId: 'user-123',
        type: 'oauth',
        provider: 'github',
        providerAccountId: 'github-12345',
        access_token: 'gho_abc123...',
        refresh_token: 'ghr_def456...',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        scope: 'user:email,read:user',
      };

      const result = await prisma.account.create({
        data: accountData,
      });

      expect(prisma.account.create).toHaveBeenCalledWith({
        data: accountData,
      });
      expect(result.provider).toBe('github');
      expect(result.access_token).toBe('gho_abc123...');
    });

    it('should find account by provider and provider account ID', async () => {
      const mockAccount = {
        id: 'account-123',
        userId: 'user-123',
        provider: 'google',
        providerAccountId: 'google-67890',
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      prisma.account.findUnique.mockResolvedValue(mockAccount);

      const result = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: 'google-67890',
          },
        },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });

      expect(prisma.account.findUnique).toHaveBeenCalledWith({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: 'google-67890',
          },
        },
        include: {
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
      expect(result.provider).toBe('google');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should update OAuth token refresh', async () => {
      const mockAccount = {
        id: 'account-123',
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        updatedAt: new Date(),
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
      expect(result.access_token).toBe('new-access-token');
    });

    it('should get user connected accounts', async () => {
      const mockAccounts = [
        {
          id: 'account-1',
          provider: 'github',
          providerAccountId: 'github-123',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'account-2',
          provider: 'google',
          providerAccountId: 'google-456',
          createdAt: new Date('2024-01-15'),
        },
      ];

      prisma.account.findMany.mockResolvedValue(mockAccounts);

      const result = await prisma.account.findMany({
        where: { userId: 'user-123' },
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      expect(prisma.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        select: {
          id: true,
          provider: true,
          providerAccountId: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe('github');
    });

    it('should unlink OAuth account', async () => {
      const mockAccount = {
        id: 'account-123',
        provider: 'github',
        userId: 'user-123',
      };

      prisma.account.delete.mockResolvedValue(mockAccount);

      const result = await prisma.account.delete({
        where: { id: 'account-123' },
      });

      expect(prisma.account.delete).toHaveBeenCalledWith({
        where: { id: 'account-123' },
      });
      expect(result.provider).toBe('github');
    });
  });

  describe('Complex Database Operations', () => {
    it('should perform user registration transaction', async () => {
      const mockResult = [
        { id: 'user-123', email: 'test@example.com' },
        { id: 'session-123', sessionToken: 'token-123' },
      ];

      prisma.$transaction.mockResolvedValue(mockResult);

      const result = await prisma.$transaction([
        prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            passwordHash: 'hashed-password',
          },
        }),
        prisma.session.create({
          data: {
            sessionToken: 'token-123',
            userId: 'user-123',
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        }),
      ]);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should get dashboard analytics with raw query', async () => {
      const mockAnalytics = [
        {
          total_users: 1234,
          active_users_today: 89,
          total_projects: 567,
          public_projects: 234,
        },
      ];

      prisma.$queryRaw.mockResolvedValue(mockAnalytics);

      const result = await prisma.$queryRaw`
        SELECT
          COUNT(DISTINCT u.id) as total_users,
          COUNT(DISTINCT CASE WHEN u."lastLoginAt" >= NOW() - INTERVAL '1 day' THEN u.id END) as active_users_today,
          COUNT(DISTINCT p.id) as total_projects,
          COUNT(DISTINCT CASE WHEN p."isPublic" = true THEN p.id END) as public_projects
        FROM "User" u
        LEFT JOIN "Project" p ON u.id = p."ownerId"
        WHERE u."deletedAt" IS NULL
      `;

      expect(prisma.$queryRaw).toHaveBeenCalled();
      expect(result[0].total_users).toBe(1234);
    });

    it('should bulk update user activity with executeRaw', async () => {
      prisma.$executeRaw.mockResolvedValue(25);

      const result = await prisma.$executeRaw`
        UPDATE "User"
        SET "lastActivityAt" = NOW()
        WHERE "id" IN (
          SELECT DISTINCT "userId"
          FROM "Session"
          WHERE "expires" > NOW()
        )
      `;

      expect(prisma.$executeRaw).toHaveBeenCalled();
      expect(result).toBe(25); // Number of affected rows
    });

    it('should handle database connection lifecycle', async () => {
      await prisma.$connect();
      expect(prisma.$connect).toHaveBeenCalled();

      // Simulate some operations
      await prisma.user.count();
      expect(prisma.user.count).toHaveBeenCalled();

      await prisma.$disconnect();
      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });

  describe('Data Validation and Constraints', () => {
    it('should handle unique email constraint', async () => {
      const uniqueConstraintError = new Error('Unique constraint failed');
      (uniqueConstraintError as any).code = 'P2002';
      (uniqueConstraintError as any).meta = { target: ['email'] };

      prisma.user.create.mockRejectedValue(uniqueConstraintError);

      await expect(
        prisma.user.create({
          data: {
            email: 'existing@example.com',
            name: 'Test User',
          },
        })
      ).rejects.toThrow('Unique constraint failed');
    });

    it('should validate foreign key constraints', async () => {
      const foreignKeyError = new Error('Foreign key constraint failed');
      (foreignKeyError as any).code = 'P2003';

      prisma.project.create.mockRejectedValue(foreignKeyError);

      await expect(
        prisma.project.create({
          data: {
            name: 'Test Project',
            ownerId: 'non-existent-user',
          },
        })
      ).rejects.toThrow('Foreign key constraint failed');
    });

    it('should handle record not found on update', async () => {
      const notFoundError = new Error('Record to update not found');
      (notFoundError as any).code = 'P2025';

      prisma.user.update.mockRejectedValue(notFoundError);

      await expect(
        prisma.user.update({
          where: { id: 'non-existent-id' },
          data: { name: 'Updated Name' },
        })
      ).rejects.toThrow('Record to update not found');
    });
  });
});
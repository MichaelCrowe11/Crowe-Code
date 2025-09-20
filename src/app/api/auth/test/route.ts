import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'crowe-logic-secret-key-change-in-production';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      message: 'Auth system is operational'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      database: 'failed',
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, name } = await req.json();

    if (action === 'register') {
      // Simple registration
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'User already exists'
        }, { status: 409 });
      }

      const hashedPassword = await hash(password, 12);
      const username = email.split('@')[0].toLowerCase();

      const user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash: hashedPassword,
          firstName: name?.split(' ')[0] || username,
          lastName: name?.split(' ').slice(1).join(' ') || '',
          role: 'USER',
          emailVerified: new Date(), // Auto-verify for testing
          twoFactorEnabled: false
        }
      });

      const token = sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim()
        },
        token
      });

    } else if (action === 'login') {
      // Simple login
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return NextResponse.json({
          success: false,
          message: 'User not found'
        }, { status: 404 });
      }

      const validPassword = await compare(password, user.passwordHash || '');

      if (!validPassword) {
        return NextResponse.json({
          success: false,
          message: 'Invalid password'
        }, { status: 401 });
      }

      const token = sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim()
        },
        token
      });

    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid action. Use "register" or "login"'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 });
  }
}
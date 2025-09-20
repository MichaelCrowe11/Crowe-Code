import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Only allow in development or with a secret key
    const setupKey = req.nextUrl.searchParams.get('key');
    if (setupKey !== 'setup-crowecode-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = 'michael@crowelogic.com';
    const password = 'CroweCode2024!';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Update existing user to admin if not already
      if (existingUser.role !== 'ADMIN') {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { role: 'ADMIN' }
        });
        return NextResponse.json({
          message: 'User updated to admin',
          email: updatedUser.email,
          role: updatedUser.role
        });
      }
      return NextResponse.json({
        message: 'User already exists as admin',
        email: existingUser.email,
        role: existingUser.role
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: 'Michael Crowe',
        role: 'ADMIN',
        emailVerified: true,
        profile: {
          create: {
            bio: 'Platform Administrator',
            avatarUrl: null,
            preferences: {}
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      credentials: {
        email,
        password,
        note: 'Please change password after first login!'
      }
    });
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({
      error: 'Failed to create admin user',
      details: error.message
    }, { status: 500 });
  }
}
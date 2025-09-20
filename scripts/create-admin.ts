import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const email = 'michael@crowelogic.com';
    const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists:', email);
      return;
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

    console.log('Admin user created successfully:', user.email);
    console.log('Password:', password);
    console.log('Please change the password after first login!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
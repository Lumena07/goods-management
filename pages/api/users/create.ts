import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if this is the first user being created
    const userCount = await prisma.user.count();
    const session = await getServerSession(req, res, authOptions);

    // Only allow user creation if it's the first user or if the request is from an admin
    if (userCount > 0 && (!session || session.user.role !== 'ADMIN')) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { name, email, role, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate temporary password if not provided
    const finalPassword = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isApproved: true, // First user or admin-created users are auto-approved
        tempPassword: !password // Mark as temporary if password was auto-generated
      },
    });

    // Only send welcome email if it's not the first user
    if (userCount > 0) {
      await sendWelcomeEmail(email, {
        name,
        password: finalPassword,
        isTemporary: !password,
      });
    }

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
} 
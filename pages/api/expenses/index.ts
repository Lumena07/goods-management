import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  
  console.log('API Session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role
  })

  if (!session || !session.user?.id) {
    console.log('Unauthorized - Missing session or user ID')
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const expenses = await prisma.expense.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: { name: true }
          },
          approver: {
            select: { name: true }
          }
        }
      })
      return res.status(200).json(expenses)
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return res.status(500).json({ message: 'Error fetching expenses' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { amount, category, description } = req.body

      if (!amount || !category || !description) {
        return res.status(400).json({ message: 'Missing required fields' })
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true }
      })

      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      const expense = await prisma.expense.create({
        data: {
          amount: parseFloat(amount),
          category,
          description,
          createdBy: session.user.id,
          status: user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
          approvedBy: user.role === 'ADMIN' ? session.user.id : null
        },
        include: {
          user: {
            select: { name: true }
          },
          approver: {
            select: { name: true }
          }
        }
      })

      return res.status(201).json(expense)
    } catch (error) {
      console.error('Error creating expense:', error)
      return res.status(500).json({ message: 'Error creating expense' })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
} 
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { id } = req.query
  const { action } = req.body

  if (!action || !['APPROVED', 'REJECTED'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' })
  }

  try {
    const expense = await prisma.expense.findUnique({
      where: { id: id as string }
    })

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' })
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({ message: 'Expense is not pending' })
    }

    const updatedExpense = await prisma.expense.update({
      where: { id: id as string },
      data: {
        status: action,
        approvedBy: session.user.id,
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

    return res.status(200).json(updatedExpense)
  } catch (error) {
    console.error('Error updating expense:', error)
    return res.status(500).json({ message: 'Error updating expense' })
  }
} 
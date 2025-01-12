import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    const [totalSales, totalPurchases, outstandingBalance] = await Promise.all([
      prisma.sale.aggregate({
        _sum: {
          total: true
        }
      }),
      prisma.purchase.aggregate({
        _sum: {
          total: true
        }
      }),
      prisma.payment.aggregate({
        _sum: {
          amount: true
        }
      })
    ])

    const metrics = {
      totalSales: totalSales._sum.total || 0,
      totalPurchases: totalPurchases._sum.total || 0,
      outstandingBalance: (totalSales._sum.total || 0) - (totalPurchases._sum.total || 0)
    }

    return res.status(200).json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return res.status(500).json({ message: 'Error fetching metrics' })
  }
} 
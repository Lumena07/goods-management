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
    const lowStockProducts = await prisma.product.findMany({
      where: {
        currentStock: {
          lte: prisma.product.fields.minStock
        }
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        minStock: true
      },
      orderBy: {
        currentStock: 'asc'
      },
      take: 10
    })

    return res.status(200).json(lowStockProducts)
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return res.status(500).json({ message: 'Error fetching low stock products' })
  }
} 
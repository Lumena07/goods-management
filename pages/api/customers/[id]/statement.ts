import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { id, month } = req.query

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
    return res.status(400).json({ message: 'Invalid month parameter' })
  }

  try {
    const [year, monthNum] = (month as string).split('-')
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0)

    const sales = await prisma.sale.findMany({
      where: {
        customerId: String(id),
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true
              }
            }
          }
        },
        payments: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return res.status(200).json(sales)
  } catch (error) {
    console.error('Error fetching statement:', error)
    return res.status(500).json({ message: 'Error fetching statement' })
  }
} 
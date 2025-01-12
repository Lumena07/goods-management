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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const skip = (page - 1) * limit

    // Fetch sales, purchases, and payments
    const [sales, purchases, payments] = await Promise.all([
      prisma.sale.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true
        }
      }),
      prisma.purchase.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true
        }
      }),
      prisma.payment.findMany({
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          sale: {
            include: {
              customer: true
            }
          }
        }
      })
    ])

    // Transform into activities
    const activities = [
      ...sales.map(sale => ({
        id: `sale-${sale.id}`,
        type: 'sale' as const,
        description: `Sale to ${sale.customer?.name || 'Walk-in Customer'}`,
        amount: sale.total,
        date: sale.createdAt
      })),
      ...purchases.map(purchase => ({
        id: `purchase-${purchase.id}`,
        type: 'purchase' as const,
        description: `Purchase from ${purchase.supplier.name}`,
        amount: purchase.total,
        date: purchase.createdAt
      })),
      ...payments.map(payment => ({
        id: `payment-${payment.id}`,
        type: 'payment' as const,
        description: `Payment received from ${payment.sale.customer?.name || 'Walk-in Customer'}`,
        amount: payment.amount,
        date: payment.createdAt
      }))
    ]

    // Sort by date
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Return only the requested number of activities
    return res.status(200).json(activities.slice(0, limit))
  } catch (error) {
    console.error('Error fetching activities:', error)
    return res.status(500).json({ message: 'Error fetching activities' })
  }
} 
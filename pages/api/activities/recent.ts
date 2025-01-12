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
    // Get recent sales
    const sales = await prisma.sale.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        total: true,
        createdAt: true,
        customer: { select: { name: true } }
      }
    })

    // Get recent purchases
    const purchases = await prisma.purchase.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        total: true,
        createdAt: true,
        supplier: { select: { name: true } }
      }
    })

    // Get recent payments
    const payments = await prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        sale: { select: { customer: { select: { name: true } } } }
      }
    })

    // Combine and format activities
    const activities = [
      ...sales.map(sale => ({
        id: `sale-${sale.id}`,
        type: 'sale' as const,
        description: `Sale to ${sale.customer?.name || 'Unknown Customer'}`,
        amount: sale.total,
        date: sale.createdAt
      })),
      ...purchases.map(purchase => ({
        id: `purchase-${purchase.id}`,
        type: 'purchase' as const,
        description: `Purchase from ${purchase.supplier?.name || 'Unknown Supplier'}`,
        amount: purchase.total,
        date: purchase.createdAt
      })),
      ...payments.map(payment => ({
        id: `payment-${payment.id}`,
        type: 'payment' as const,
        description: `Payment from ${payment.sale?.customer?.name || 'Unknown Customer'}`,
        amount: payment.amount,
        date: payment.createdAt
      }))
    ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

    return res.status(200).json(activities)
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return res.status(500).json({ message: 'Error fetching recent activities' })
  }
} 
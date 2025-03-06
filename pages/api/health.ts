import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    // Get counts from all tables
    const counts = {
      users: await prisma.user.count(),
      suppliers: await prisma.supplier.count(),
      customers: await prisma.customer.count(),
      products: await prisma.product.count(),
      purchases: await prisma.purchase.count(),
      purchaseItems: await prisma.purchaseItem.count(),
      sales: await prisma.sale.count(),
      saleItems: await prisma.saleItem.count(),
    }

    return res.status(200).json({
      status: 'healthy',
      database: 'connected',
      environment: process.env.NODE_ENV,
      counts,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      environment: process.env.NODE_ENV,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
} 
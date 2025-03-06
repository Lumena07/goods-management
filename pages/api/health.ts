import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

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
    
    // Return health status
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      env: {
        node_env: process.env.NODE_ENV,
        has_database_url: !!process.env.DATABASE_URL,
        database_host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'unknown'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      env: {
        node_env: process.env.NODE_ENV,
        has_database_url: !!process.env.DATABASE_URL,
        database_host: process.env.DATABASE_URL?.split('@')[1]?.split(':')[0] || 'unknown'
      }
    })
  }
} 
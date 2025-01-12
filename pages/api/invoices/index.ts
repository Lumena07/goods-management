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
    const { status, customer, startDate, endDate } = req.query

    // Build filter conditions
    const where: any = {
      invoiceNumber: { not: null } // Only get sales with invoices
    }

    if (status) {
      where.isPaid = status === 'paid'
    }

    if (customer) {
      where.customer = {
        name: { contains: String(customer), mode: 'insensitive' }
      }
    }

    if (startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(String(startDate))
      }
    }

    if (endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(String(endDate))
      }
    }

    const invoices = await prisma.sale.findMany({
      where,
      select: {
        id: true,
        invoiceNumber: true,
        customer: {
          select: {
            name: true
          }
        },
        total: true,
        isPaid: true,
        dueDate: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json(invoices)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return res.status(500).json({ message: 'Error fetching invoices' })
  }
} 
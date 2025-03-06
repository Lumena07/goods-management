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

  const { id } = req.query
  const supplierId = String(id)

  if (req.method === 'GET') {
    try {
      const prices = await prisma.supplierPrice.findMany({
        where: { supplierId },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      })
      return res.status(200).json(prices)
    } catch (error) {
      console.error('Error fetching supplier prices:', error)
      return res.status(500).json({ message: 'Error fetching supplier prices' })
    }
  }

  if (req.method === 'POST') {
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const { productId, price } = req.body

    if (!productId || !price) {
      return res.status(400).json({ message: 'Missing required fields' })
    }

    try {
      const supplierPrice = await prisma.supplierPrice.create({
        data: {
          supplierId,
          productId,
          price: parseFloat(price)
        },
        include: {
          product: {
            select: {
              name: true
            }
          }
        }
      })
      return res.status(201).json(supplierPrice)
    } catch (error) {
      console.error('Error creating supplier price:', error)
      return res.status(500).json({ message: 'Error creating supplier price' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
} 

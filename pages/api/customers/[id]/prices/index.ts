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

  switch (req.method) {
    case 'GET':
      try {
        const prices = await prisma.customPrice.findMany({
          where: { customerId: String(id) },
          include: {
            product: {
              select: {
                name: true,
                basePrice: true
              }
            }
          }
        })
        return res.status(200).json(prices)
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching custom prices' })
      }

    case 'POST':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        const price = await prisma.customPrice.create({
          data: {
            customerId: String(id),
            productId: req.body.productId,
            price: req.body.price
          },
          include: {
            product: {
              select: {
                name: true,
                basePrice: true
              }
            }
          }
        })
        return res.status(201).json(price)
      } catch (error) {
        return res.status(500).json({ message: 'Error creating custom price' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
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

  const supplierId = req.query.id as string

  switch (req.method) {
    case 'GET':
      try {
        const prices = await prisma.supplierPrice.findMany({
          where: { supplierId },
          include: {
            product: {
              select: {
                id: true,
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

    case 'POST':
      try {
        const { productId, price } = req.body

        const supplierPrice = await prisma.supplierPrice.create({
          data: {
            supplierId: String(id),
            productId,
            price: parseFloat(price)
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                basePrice: true
              }
            }
          }
        })
        return res.status(201).json(supplierPrice)
      } catch (error) {
        console.error('Error creating supplier price:', error)
        return res.status(500).json({ message: 'Error creating supplier price' })
      }

    case 'DELETE':
      try {
        const { priceId } = req.query
        await prisma.supplierPrice.delete({
          where: { id: String(priceId) }
        })
        return res.status(204).end()
      } catch (error) {
        console.error('Error deleting supplier price:', error)
        return res.status(500).json({ message: 'Error deleting supplier price' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
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

  switch (req.method) {
    case 'GET':
      try {
        const purchases = await prisma.purchase.findMany({
          include: {
            supplier: true,
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(purchases)
      } catch (error) {
        console.error('Error fetching purchases:', error)
        return res.status(500).json({ message: 'Error fetching purchases' })
      }

    case 'POST':
      try {
        const { supplierId, items } = req.body

        // Verify all prices match supplier's prices
        const supplierPrices = await prisma.supplierPrice.findMany({
          where: { supplierId }
        })

        for (const item of items) {
          const supplierPrice = supplierPrices.find(sp => sp.productId === item.productId)
          if (!supplierPrice || supplierPrice.price !== item.price) {
            return res.status(400).json({ 
              message: 'Item prices must match supplier prices' 
            })
          }
        }

        const purchase = await prisma.purchase.create({
          data: {
            supplierId,
            total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          },
          include: {
            supplier: true,
            items: {
              include: {
                product: true
              }
            }
          }
        })

        return res.status(201).json(purchase)
      } catch (error) {
        console.error('Error creating purchase:', error)
        return res.status(500).json({ message: 'Error creating purchase' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
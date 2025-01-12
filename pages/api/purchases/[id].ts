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
        const purchase = await prisma.purchase.findUnique({
          where: { id: String(id) },
          include: {
            supplier: true,
            items: {
              include: {
                product: true
              }
            }
          }
        })

        if (!purchase) {
          return res.status(404).json({ message: 'Purchase not found' })
        }

        return res.status(200).json(purchase)
      } catch (error) {
        console.error('Error fetching purchase:', error)
        return res.status(500).json({ message: 'Error fetching purchase' })
      }

    case 'PUT':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        const { status, receivedItems } = req.body

        // Start a transaction
        const result = await prisma.$transaction(async (tx) => {
          const purchase = await tx.purchase.update({
            where: { id: String(id) },
            data: {
              status: 'RECEIVED',
              receivedAt: new Date(),
              items: {
                update: receivedItems.map((item) => ({
                  where: { id: item.id },
                  data: { received: item.received }
                }))
              }
            },
            include: {
              items: {
                include: {
                  product: true
                }
              }
            }
          })

          // Update product stock
          for (const item of receivedItems) {
            const purchaseItem = purchase.items.find(pi => pi.id === item.id)
            if (!purchaseItem) continue

            await tx.product.update({
              where: { id: purchaseItem.productId },
              data: {
                currentStock: {
                  increment: item.received
                }
              }
            })
          }

          return purchase
        })

        return res.status(200).json(result)
      } catch (error) {
        console.error('Error updating purchase:', error)
        return res.status(500).json({ message: 'Error updating purchase' })
      }

    case 'DELETE':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        // Start a transaction to handle stock updates
        await prisma.$transaction(async (tx) => {
          // First get the purchase with its items
          const purchase = await tx.purchase.findUnique({
            where: { id: String(id) },
            include: {
              items: true
            }
          })

          if (!purchase) {
            throw new Error('Purchase not found')
          }

          // If purchase was received, revert the stock changes
          if (purchase.status === 'RECEIVED') {
            for (const item of purchase.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  currentStock: {
                    decrement: item.received || 0
                  }
                }
              })
            }
          }

          // Delete the purchase
          await tx.purchase.delete({
            where: { id: String(id) }
          })
        })

        return res.status(204).end()
      } catch (error) {
        console.error('Error deleting purchase:', error)
        return res.status(500).json({ message: 'Error deleting purchase' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
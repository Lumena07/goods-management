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

  if (req.method === 'GET') {
    try {
      const sale = await prisma.sale.findUnique({
        where: { id: String(id) },
        include: {
          customer: {
            select: {
              name: true,
              address: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })

      if (!sale) {
        return res.status(404).json({ message: 'Sale not found' })
      }

      // Calculate due date (30 days from creation for accredited sales)
      const dueDate = new Date(sale.createdAt)
      dueDate.setDate(dueDate.getDate() + 30)

      // Format the response
      const formattedSale = {
        ...sale,
        dueDate: dueDate.toISOString(),
        items: sale.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount || 0
        }))
      }

      return res.status(200).json(formattedSale)
    } catch (error) {
      console.error('Error fetching sale:', error)
      return res.status(500).json({ message: 'Error fetching sale' })
    }
  }

  if (req.method === 'DELETE') {
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' })
    }

    try {
      // Start a transaction to handle stock updates
      await prisma.$transaction(async (tx) => {
        // First get the sale with its items
        const sale = await tx.sale.findUnique({
          where: { id: String(id) },
          include: {
            items: true
          }
        })

        if (!sale) {
          throw new Error('Sale not found')
        }

        // Revert the stock changes
        for (const item of sale.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: {
                increment: item.quantity
              }
            }
          })
        }

        // Delete the sale and its items (cascade delete will handle items)
        await tx.sale.delete({
          where: { id: String(id) }
        })
      })

      return res.status(204).end()
    } catch (error) {
      console.error('Error deleting sale:', error)
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Error deleting sale' 
      })
    }
  }

  res.setHeader('Allow', ['GET', 'DELETE'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
} 
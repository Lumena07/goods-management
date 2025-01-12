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
        const sales = await prisma.sale.findMany({
          include: {
            customer: true,
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(sales)
      } catch (error) {
        console.error('Error fetching sales:', error)
        return res.status(500).json({ message: 'Error fetching sales' })
      }

    case 'POST':
      try {
        const { customerId, items, isAccredited } = req.body

        // Validate stock levels
        for (const item of items) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId }
          })
          
          if (!product) {
            return res.status(400).json({ 
              message: `Product not found: ${item.productId}` 
            })
          }

          if (product.currentStock <= product.minStock) {
            return res.status(400).json({ 
              message: `${product.name} is at or below minimum stock level` 
            })
          }

          if (product.currentStock < item.quantity) {
            return res.status(400).json({ 
              message: `Insufficient stock for ${product.name}` 
            })
          }
        }

        // If accredited sale, validate customer credit limit
        if (isAccredited && customerId) {
          const customer = await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
              sales: {
                where: { isPaid: false }
              }
            }
          })

          if (!customer?.isAccredited) {
            return res.status(400).json({ 
              message: 'Customer is not accredited for credit sales' 
            })
          }

          const unpaidTotal = customer.sales.reduce((sum, sale) => sum + sale.total, 0)
          const newTotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

          if (customer.creditLimit && (unpaidTotal + newTotal) > customer.creditLimit) {
            return res.status(400).json({ 
              message: 'Sale would exceed customer credit limit' 
            })
          }
        }

        // Create sale and update stock in transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create the sale
          const sale = await tx.sale.create({
            data: {
              customerId,
              isAccredited,
              isPaid: !isAccredited, // Cash sales are paid immediately
              total: items.reduce((sum, item) => sum + (item.quantity * item.price), 0),
              invoiceNumber: isAccredited ? `INV-${Date.now()}` : null,
              dueDate: isAccredited ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days
              items: {
                create: items.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  discount: item.discount || 0
                }))
              }
            },
            include: {
              customer: true,
              items: {
                include: {
                  product: true
                }
              }
            }
          })

          // Update stock levels
          for (const item of items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: {
                  decrement: item.quantity
                }
              }
            })
          }

          return sale
        })

        return res.status(201).json(result)
      } catch (error) {
        console.error('Error creating sale:', error)
        return res.status(500).json({ message: 'Error creating sale' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
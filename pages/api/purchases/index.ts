import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { calculateVat } from '@/lib/utils/vat'

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

        // Get supplier's VAT preference
        const supplier = await prisma.supplier.findUnique({
          where: { id: supplierId }
        })

        if (!supplier) {
          return res.status(400).json({ message: 'Supplier not found' })
        }

        // Calculate totals with VAT
        const calculatedItems = items.map(item => {
          const subtotal = item.quantity * item.price
          const { basePrice, vatAmount, totalPrice } = calculateVat(subtotal, supplier.vatPreference)

          return {
            ...item,
            basePrice,
            vatAmount,
            total: totalPrice
          }
        })

        const purchaseTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0)
        const purchaseBasePrice = calculatedItems.reduce((sum, item) => sum + item.basePrice, 0)
        const purchaseVatAmount = calculatedItems.reduce((sum, item) => sum + item.vatAmount, 0)

        // Create purchase in transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create the purchase
          const purchase = await tx.purchase.create({
            data: {
              supplierId,
              total: purchaseTotal,
              basePrice: purchaseBasePrice,
              vatAmount: purchaseVatAmount,
              items: {
                create: calculatedItems.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  basePrice: item.basePrice,
                  vatAmount: item.vatAmount
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

          return purchase
        })

        return res.status(201).json(result)
      } catch (error) {
        console.error('Error creating purchase:', error)
        return res.status(500).json({ message: 'Error creating purchase' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
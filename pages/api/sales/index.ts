import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { calculateVat } from '@/lib/utils/vat'

type VatPreference = 'VAT_INCLUSIVE' | 'VAT_EXCLUSIVE'

interface CustomerWithPrices {
  id: string
  vatPreference: VatPreference
  creditLimit: number
  customPrices: Array<{
    productId: string
    price: number
  }>
}

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

        // Get customer's VAT preference
        const customer = (await prisma.customer.findUnique({
          where: { id: customerId },
          include: {
            customPrices: true
          }
        }) as unknown) as CustomerWithPrices

        if (!customer) {
          return res.status(400).json({ message: 'Customer not found' })
        }

        // Calculate totals with VAT
        const calculatedItems = items.map(item => {
          const customerPrice = customer.customPrices.find(cp => cp.productId === item.productId)
          const price = customerPrice ? customerPrice.price : item.price
          
          const subtotal = item.quantity * price
          const discountAmount = (subtotal * (item.discount || 0)) / 100
          const afterDiscount = subtotal - discountAmount
          
          const { basePrice, vatAmount, totalPrice } = calculateVat(afterDiscount, customer.vatPreference)

          return {
            ...item,
            price,
            basePrice,
            vatAmount,
            total: totalPrice
          }
        })

        // Use the totals from the form
        const { total: saleTotal, basePrice: saleBasePrice, vatAmount: saleVatAmount } = req.body

        // Check credit limit for accredited sales
        if (isAccredited) {
          const unpaidTotal = await prisma.sale.aggregate({
            where: {
              customerId,
              isPaid: false
            },
            _sum: {
              total: true
            }
          })

          const currentUnpaid = unpaidTotal._sum.total || 0
          if (currentUnpaid + saleTotal > customer.creditLimit) {
            return res.status(400).json({ 
              message: 'This sale would exceed the customer\'s credit limit' 
            })
          }
        }

        // Create sale in transaction
        const result = await prisma.$transaction(async (tx) => {
          // Create the sale
          const sale = await tx.sale.create({
            data: {
              customerId,
              isAccredited,
              isPaid: !isAccredited, // Cash sales are paid immediately
              total: saleTotal,
              basePrice: saleBasePrice,
              vatAmount: saleVatAmount,
              invoiceNumber: isAccredited ? `INV-${Date.now()}` : null,
              dueDate: isAccredited ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null, // 30 days for accredited sales
              items: {
                create: calculatedItems.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price,
                  discount: item.discount || 0,
                  basePrice: item.basePrice,
                  vatAmount: item.vatAmount
                }))
              }
            } as any,
            include: {
              customer: true,
              items: {
                include: {
                  product: true
                }
              }
            }
          })

          // Update stock
          for (const item of calculatedItems) {
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
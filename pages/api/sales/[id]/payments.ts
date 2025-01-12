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
        const payments = await prisma.payment.findMany({
          where: { saleId: String(id) },
          orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(payments)
      } catch (error) {
        console.error('Error fetching payments:', error)
        return res.status(500).json({ message: 'Error fetching payments' })
      }

    case 'POST':
      try {
        const { amount, method, reference, notes } = req.body

        // Start transaction
        const result = await prisma.$transaction(async (tx) => {
          // Get sale and current payments
          const sale = await tx.sale.findUnique({
            where: { id: String(id) },
            include: { payments: true }
          })

          if (!sale) {
            throw new Error('Sale not found')
          }

          if (sale.isPaid) {
            throw new Error('Sale is already fully paid')
          }

          // Create new payment
          const payment = await tx.payment.create({
            data: {
              saleId: String(id),
              amount: parseFloat(amount),
              method,
              reference,
              notes,
              recordedBy: session.user.email!
            }
          })

          // Calculate total paid amount
          const totalPaid = sale.payments.reduce(
            (sum, p) => sum + p.amount, 
            0
          ) + parseFloat(amount)

          // Update sale paid status if fully paid
          if (totalPaid >= sale.total) {
            await tx.sale.update({
              where: { id: String(id) },
              data: { isPaid: true }
            })
          }

          return payment
        })

        return res.status(201).json(result)
      } catch (error) {
        console.error('Error recording payment:', error)
        if (error instanceof Error) {
          return res.status(400).json({ message: error.message })
        }
        return res.status(500).json({ message: 'Error recording payment' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
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
        const customer = await prisma.customer.findUnique({
          where: { id: String(id) },
          include: {
            customPrices: {
              include: {
                product: {
                  select: {
                    name: true,
                    basePrice: true
                  }
                }
              }
            },
            sales: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        })

        if (!customer) {
          return res.status(404).json({ message: 'Customer not found' })
        }

        return res.status(200).json(customer)
      } catch (error) {
        console.error('Error fetching customer:', error)
        return res.status(500).json({ message: 'Error fetching customer' })
      }

    case 'PUT':
      try {
        const { name, email, phone, isAccredited, creditLimit } = req.body

        const customer = await prisma.customer.update({
          where: { id: String(id) },
          data: {
            name,
            email,
            phone,
            isAccredited,
            creditLimit
          }
        })
        return res.status(200).json(customer)
      } catch (error) {
        console.error('Error updating customer:', error)
        return res.status(500).json({ message: 'Error updating customer' })
      }

    case 'DELETE':
      try {
        await prisma.customer.delete({
          where: { id: String(id) }
        })
        return res.status(204).end()
      } catch (error) {
        console.error('Error deleting customer:', error)
        return res.status(500).json({ message: 'Error deleting customer' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
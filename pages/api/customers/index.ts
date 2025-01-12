import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { VatPreference } from '@prisma/client'

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
        const customers = await prisma.customer.findMany({
          orderBy: {
            name: 'asc'
          },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isAccredited: true,
            creditLimit: true,
            vatPreference: true,
            _count: {
              select: {
                sales: true
              }
            }
          }
        })
        return res.status(200).json(customers)
      } catch (error) {
        console.error('Error fetching customers:', error)
        return res.status(500).json({ message: 'Error fetching customers' })
      }

    case 'POST':
      try {
        const { name, email, phone, isAccredited, creditLimit } = req.body

        const customer = await prisma.customer.create({
          data: {
            name,
            email,
            phone,
            address: req.body.address,
            isAccredited: isAccredited || false,
            creditLimit: creditLimit || 0,
            vatPreference: req.body.vatPreference || 'VAT_INCLUSIVE'
          }
        })
        return res.status(201).json(customer)
      } catch (error) {
        console.error('Error creating customer:', error)
        return res.status(500).json({ message: 'Error creating customer' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
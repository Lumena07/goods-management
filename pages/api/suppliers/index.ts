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
        const suppliers = await prisma.supplier.findMany({
          include: {
            prices: {
              include: {
                product: true
              }
            }
          }
        })
        return res.status(200).json(suppliers)
      } catch (error) {
        return res.status(500).json({ message: 'Error fetching suppliers' })
      }

    case 'POST':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        const supplier = await prisma.supplier.create({
          data: {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address
          }
        })
        return res.status(201).json(supplier)
      } catch (error) {
        return res.status(500).json({ message: 'Error creating supplier' })
      }

    default:
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
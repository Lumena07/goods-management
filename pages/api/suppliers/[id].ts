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
        const supplier = await prisma.supplier.findUnique({
          where: { id: String(id) },
          include: {
            purchases: {
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            }
          }
        })

        if (!supplier) {
          return res.status(404).json({ message: 'Supplier not found' })
        }

        return res.status(200).json(supplier)
      } catch (error) {
        console.error('Error fetching supplier:', error)
        return res.status(500).json({ message: 'Error fetching supplier' })
      }

    default:
      res.setHeader('Allow', ['GET'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
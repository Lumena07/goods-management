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

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden' })
  }

  const { id, priceId } = req.query

  if (req.method === 'DELETE') {
    try {
      await prisma.supplierPrice.delete({
        where: {
          id: String(priceId)
        }
      })
      return res.status(204).end()
    } catch (error) {
      console.error('Error deleting supplier price:', error)
      return res.status(500).json({ message: 'Error deleting supplier price' })
    }
  }

  res.setHeader('Allow', ['DELETE'])
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
} 
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
        const product = await prisma.product.findUnique({
          where: { id: String(id) }
        })

        if (!product) {
          return res.status(404).json({ message: 'Product not found' })
        }

        return res.status(200).json(product)
      } catch (error) {
        console.error('Error fetching product:', error)
        return res.status(500).json({ message: 'Error fetching product' })
      }

    case 'PUT':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        const { name, basePrice, currentStock, minStock } = req.body

        const product = await prisma.product.update({
          where: { id: String(id) },
          data: {
            name,
            basePrice: parseFloat(basePrice),
            currentStock: parseInt(currentStock),
            minStock: parseInt(minStock)
          }
        })
        return res.status(200).json(product)
      } catch (error) {
        console.error('Error updating product:', error)
        return res.status(500).json({ message: 'Error updating product' })
      }

    case 'DELETE':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        await prisma.product.delete({
          where: { id: String(id) }
        })
        return res.status(204).end()
      } catch (error) {
        console.error('Error deleting product:', error)
        return res.status(500).json({ message: 'Error deleting product' })
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 
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
    const { filterByStock } = req.query
    const whereClause = filterByStock === 'true' ? {
      currentStock: {
        gt: prisma.product.fields.minStock
      }
    } : {}

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        name: 'asc'
      },
      include: {
        customPrices: true
      }
    })
    return res.status(200).json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return res.status(500).json({ message: 'Error fetching products' })
  }

    case 'POST':
      if (session.user.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Forbidden' })
      }

      try {
        const { name, basePrice, currentStock, minStock } = req.body

        const product = await prisma.product.create({
          data: {
            name,
            basePrice: parseFloat(basePrice),
            currentStock: parseInt(currentStock),
            minStock: parseInt(minStock)
          }
        })
        return res.status(201).json(product)
      } catch (error) {
        console.error('Error creating product:', error)
        return res.status(500).json({ message: 'Error creating product' })
      }

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }
} 

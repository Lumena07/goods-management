import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getSession } from 'next-auth/react'

interface ProductData {
  product: {
    id: string
    name: string
    currentStock: number
    minStock: number
  }
  sales: Array<{
    quantity: number
    date: Date
  }>
  totalQuantity: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get all sales data with products and dates
    const salesData = await prisma.sale.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group sales by product
    const productSales = {}
    salesData.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.product.id]) {
          productSales[item.product.id] = {
            product: item.product,
            sales: [],
            totalQuantity: 0,
            monthlyAverages: {},
            reorderPoint: 0
          }
        }
        productSales[item.product.id].sales.push({
          quantity: item.quantity,
          date: sale.createdAt
        })
        productSales[item.product.id].totalQuantity += item.quantity
      })
    })

    // Calculate patterns and predictions for each product
    const patterns = Object.values(productSales).map((productData: ProductData) => {
      const { product, sales, totalQuantity } = productData

      // Calculate monthly averages
      const monthlyAverages = {}
      sales.forEach(sale => {
        const month = sale.date.getMonth()
        if (!monthlyAverages[month]) {
          monthlyAverages[month] = { total: 0, count: 0 }
        }
        monthlyAverages[month].total += sale.quantity
        monthlyAverages[month].count++
      })

      // Convert to average and identify seasonal trends
      const seasonalTrends = Object.entries(monthlyAverages).map(([month, data]: [string, any]) => ({
        month: parseInt(month),
        average: data.total / data.count
      })).sort((a, b) => b.average - a.average)

      // Calculate reorder point based on average monthly sales and lead time
      const monthlyAverage = totalQuantity / (sales.length || 1)
      const leadTimeMonths = 1 // Assume 1 month lead time
      const safetyStock = monthlyAverage * 0.5 // 50% safety stock
      const reorderPoint = Math.ceil((monthlyAverage * leadTimeMonths) + safetyStock)

      // Predict next month's demand
      const lastThreeMonths = sales.slice(-3)
      const recentAverage = lastThreeMonths.reduce((sum, sale) => sum + sale.quantity, 0) / 3
      const predictedDemand = Math.ceil(recentAverage * 1.1) // Add 10% buffer

      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.currentStock,
        minStock: product.minStock,
        totalSales: totalQuantity,
        averageMonthly: monthlyAverage,
        seasonalTrends,
        reorderPoint,
        predictedDemand,
        stockStatus: product.currentStock < reorderPoint ? 'REORDER_NEEDED' : 'OK',
        recommendations: [
          product.currentStock < reorderPoint ? 
            `Reorder soon. Suggested quantity: ${predictedDemand - product.currentStock}` : 
            'Stock levels adequate',
          seasonalTrends[0]?.average > monthlyAverage * 1.2 ?
            `High demand expected in month ${seasonalTrends[0].month + 1}` :
            null
        ].filter(Boolean)
      }
    })

    return res.status(200).json({
      patterns,
      summary: {
        totalProducts: patterns.length,
        needsReorder: patterns.filter(p => p.stockStatus === 'REORDER_NEEDED').length,
        topSellers: patterns.sort((a, b) => b.totalSales - a.totalSales).slice(0, 5)
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return res.status(500).json({ error: 'Error analyzing patterns' })
  }
} 

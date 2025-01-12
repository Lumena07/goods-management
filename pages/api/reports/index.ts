import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (session?.user.role !== 'ADMIN') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  try {
    const { type, filters } = req.body
    const { startDate, endDate, status } = filters

    let data
    let title
    let headers
    let rows

    switch (type) {
      case 'sales':
        data = await prisma.sale.findMany({
          where: {
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            },
            ...(status && { isPaid: status === 'paid' })
          },
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

        title = 'Sales Report'
        headers = ['Date', 'Invoice #', 'Customer', 'Items', 'Total', 'Status']
        rows = data.map(sale => [
          new Date(sale.createdAt).toLocaleDateString(),
          sale.invoiceNumber || '-',
          sale.customer?.name || 'Walk-in Customer',
          sale.items.length.toString(),
          `TZS ${sale.total.toLocaleString()}`,
          sale.isPaid ? 'Paid' : 'Unpaid'
        ])
        break

      case 'stock':
        data = await prisma.product.findMany({
          orderBy: { name: 'asc' }
        })

        title = 'Stock Level Report'
        headers = ['Product', 'Current Stock', 'Minimum Stock', 'Status']
        rows = data.map(product => [
          product.name,
          product.currentStock.toString(),
          product.minStock.toString(),
          product.currentStock <= product.minStock ? 'Low Stock' : 'OK'
        ])
        break

      // Add other report types...
    }

    // Generate PDF
    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`)

    doc.pipe(res)

    // Add title
    doc.fontSize(20).text(title, { align: 'center' })
    doc.moveDown()
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`)
    doc.moveDown()

    // Add date range for non-stock reports
    if (type !== 'stock') {
      doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`)
      doc.moveDown()
    }

    // Add table
    const tableTop = doc.y
    const columnWidth = 100
    
    // Draw headers
    headers.forEach((header, i) => {
      doc.text(header, 50 + (i * columnWidth), tableTop)
    })

    // Draw rows
    let y = tableTop + 20
    rows.forEach((row) => {
      row.forEach((cell, i) => {
        doc.text(cell, 50 + (i * columnWidth), y)
      })
      y += 20
    })

    // Add summary if applicable
    if (type === 'sales') {
      const total = data.reduce((sum, sale) => sum + sale.total, 0)
      doc.moveDown()
      doc.text(`Total Sales: TZS ${total.toLocaleString()}`, { align: 'right' })
    }

    doc.end()
  } catch (error) {
    console.error('Error generating report:', error)
    return res.status(500).json({ message: 'Error generating report' })
  }
} 
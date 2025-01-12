import PDFDocument from 'pdfkit'
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

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` })
  }

  try {
    const { id } = req.query

    const sale = await prisma.sale.findUnique({
      where: { id: String(id) },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!sale || !sale.invoiceNumber) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    // Create PDF
    const doc = new PDFDocument()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.id}.pdf`)

    doc.pipe(res)

    // Add company info
    doc.fontSize(20).text('COMPANY NAME', { align: 'right' })
    doc.fontSize(10)
      .text('123 Business Street', { align: 'right' })
      .text('City, Country', { align: 'right' })
      .text('Phone: +1234567890', { align: 'right' })
      .moveDown()

    // Add invoice details
    doc.fontSize(16).text('INVOICE', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10)
      .text(`Invoice Number: ${sale.invoiceNumber}`)
      .text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`)
      .text(`Due Date: ${new Date(sale.dueDate!).toLocaleDateString()}`)
      .moveDown()

    // Add customer info
    doc.text('Bill To:')
    doc.text(sale.customer?.name || 'Walk-in Customer')
    if (sale.customer?.address) doc.text(sale.customer.address)
    doc.moveDown()

    // Add items table
    const tableTop = doc.y
    doc.text('Item', 50, tableTop)
    doc.text('Quantity', 200, tableTop)
    doc.text('Price', 300, tableTop)
    doc.text('Amount', 400, tableTop)

    let y = tableTop + 20
    sale.items.forEach((item) => {
      doc.text(item.product.name, 50, y)
      doc.text(item.quantity.toString(), 200, y)
      doc.text(`TZS ${item.price.toLocaleString()}`, 300, y)
      doc.text(`TZS ${(item.quantity * item.price).toLocaleString()}`, 400, y)
      y += 20
    })

    doc.moveDown()
    doc.text(`Total: TZS ${sale.total.toLocaleString()}`, { align: 'right' })

    // Finalize PDF
    doc.end()
  } catch (error) {
    console.error('Error generating invoice PDF:', error)
    return res.status(500).json({ message: 'Error generating invoice PDF' })
  }
} 
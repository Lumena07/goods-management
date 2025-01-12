import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import PDFDocument from 'pdfkit'
import { calculateVat } from '@/lib/utils/vat'

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
        const startDateTime = new Date(startDate)
        startDateTime.setHours(0, 0, 0, 0)
        
        const endDateTime = new Date(endDate)
        endDateTime.setHours(23, 59, 59, 999)
        
        console.log('Date range:', { startDateTime, endDateTime })
        
        data = await prisma.sale.findMany({
          where: {
            createdAt: {
              gte: startDateTime,
              lte: endDateTime
            },
            ...(status === 'paid' && { isPaid: true }),
            ...(status === 'unpaid' && { isPaid: false })
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
        
        console.log('Found sales:', data.length)

        title = 'Sales Report'
        if (status) {
          title += ` (${status.charAt(0).toUpperCase() + status.slice(1)})`
        }
        headers = ['Date', 'Customer', 'Items', 'Sub-total', 'VAT', 'Total']
        rows = data.map(sale => [
          new Date(sale.createdAt).toLocaleDateString(),
          sale.customer?.name || 'Walk-in Customer',
          sale.items.map(item => `${item.product.name} (${item.quantity})`).join(', '),
          sale.basePrice.toLocaleString(),
          sale.vatAmount.toLocaleString(),
          sale.total.toLocaleString()
        ])

        // Add summary
        const salesSummary = data.reduce((sum, sale) => ({
          basePrice: sum.basePrice + sale.basePrice,
          vatAmount: sum.vatAmount + sale.vatAmount,
          total: sum.total + sale.total
        }), { basePrice: 0, vatAmount: 0, total: 0 })

        rows.push([
          '',
          'TOTAL',
          '',
          salesSummary.basePrice.toLocaleString(),
          salesSummary.vatAmount.toLocaleString(),
          salesSummary.total.toLocaleString()
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

      case 'purchases':
        const purchaseStartDateTime = new Date(startDate)
        purchaseStartDateTime.setHours(0, 0, 0, 0)
        
        const purchaseEndDateTime = new Date(endDate)
        purchaseEndDateTime.setHours(23, 59, 59, 999)
        
        data = await prisma.purchase.findMany({
          where: {
            createdAt: {
              gte: purchaseStartDateTime,
              lte: purchaseEndDateTime
            },
            ...(status === 'paid' && { isPaid: true }),
            ...(status === 'unpaid' && { isPaid: false }),
            ...(status === 'received' && { status: 'RECEIVED' })
          },
          include: {
            supplier: true,
            items: {
              include: {
                product: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        
        console.log('Found purchases:', data.length)

        title = 'Purchase Report'
        if (status) {
          title += ` (${status.charAt(0).toUpperCase() + status.slice(1)})`
        }
        headers = ['Date', 'Supplier', 'Items', 'Sub-total', 'VAT', 'Total']
        rows = data.map(purchase => [
          new Date(purchase.createdAt).toLocaleDateString(),
          purchase.supplier.name,
          purchase.items.map(item => `${item.product.name} (${item.quantity})`).join(', '),
          purchase.basePrice.toLocaleString(),
          purchase.vatAmount.toLocaleString(),
          purchase.total.toLocaleString()
        ])

        // Add summary
        const purchaseSummary = data.reduce((sum, purchase) => ({
          basePrice: sum.basePrice + purchase.basePrice,
          vatAmount: sum.vatAmount + purchase.vatAmount,
          total: sum.total + purchase.total
        }), { basePrice: 0, vatAmount: 0, total: 0 })

        rows.push([
          '',
          'TOTAL',
          '',
          purchaseSummary.basePrice.toLocaleString(),
          purchaseSummary.vatAmount.toLocaleString(),
          purchaseSummary.total.toLocaleString()
        ])
        break

      case 'customers':
        const customerStartDateTime = new Date(startDate)
        customerStartDateTime.setHours(0, 0, 0, 0)
        
        const customerEndDateTime = new Date(endDate)
        customerEndDateTime.setHours(23, 59, 59, 999)
        // Get all accredited customers
        const customers = await prisma.customer.findMany({
          where: {
            isAccredited: true
          },
          include: {
            sales: {
              where: {
                createdAt: {
                  gte: customerStartDateTime,
                  lte: customerEndDateTime
                },
                isAccredited: true
              },
              include: {
                payments: true
              }
            }
          },
          orderBy: { name: 'asc' }
        })

        if (!customers || customers.length === 0) {
          return res.status(404).json({ message: 'No accredited customers found for the selected period' })
        }

        // Process customer data
        data = customers.map(customer => {
          const totalCredit = customer.sales.reduce((sum, sale) => sum + sale.total, 0)
          const totalPaid = customer.sales.reduce((sum, sale) => 
            sum + sale.payments.reduce((pSum, payment) => pSum + payment.amount, 0), 0)
          const outstandingBalance = totalCredit - totalPaid

          return {
            name: customer.name,
            creditLimit: customer.creditLimit || 0,
            totalCredit,
            totalPaid,
            outstandingBalance
          }
        })

        // Filter based on payment status if specified
        if (status) {
          data = data.filter(customer => {
            if (status === 'paid') {
              return customer.outstandingBalance <= 0
            } else if (status === 'unpaid') {
              return customer.outstandingBalance > 0
            }
            return true
          })
        }

        if (!data || data.length === 0) {
          return res.status(404).json({ message: 'No credit data found for the selected period and status' })
        }

        title = 'Customer Credit Report'
        if (status) {
          title += ` (${status.charAt(0).toUpperCase() + status.slice(1)})`
        }
        headers = ['Customer', 'Credit Limit', 'Total Credit', 'Total Paid', 'Outstanding Balance']
        rows = data.map(customer => [
          customer.name,
          customer.creditLimit.toLocaleString(),
          customer.totalCredit.toLocaleString(),
          customer.totalPaid.toLocaleString(),
          customer.outstandingBalance.toLocaleString()
        ])

        if (!rows || rows.length === 0) {
          return res.status(404).json({ message: 'Failed to generate report rows' })
        }
        break

      case 'vat':
        // Get sales and purchases for VAT calculation
        const salesData = await prisma.sale.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true
              }
            }
          }
        })

        const purchasesData = await prisma.purchase.findMany({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          },
          include: {
            supplier: true,
            items: {
              include: {
                product: true
              }
            }
          }
        })

        const outputVat = salesData.reduce((sum, sale) => {
          const { vatAmount } = calculateVat(sale.total, 'VAT_INCLUSIVE')
          return sum + vatAmount
        }, 0)

        const inputVat = purchasesData.reduce((sum, purchase) => {
          const { vatAmount } = calculateVat(purchase.total, 'VAT_INCLUSIVE')
          return sum + vatAmount
        }, 0)

        const netVat = outputVat - inputVat

        title = 'VAT Report'
        headers = ['Type', 'Base Amount', 'VAT Amount']
        rows = [
          ['Output VAT (Sales)', 
            salesData.reduce((sum, sale) => {
              const { basePrice } = calculateVat(sale.total, 'VAT_INCLUSIVE')
              return sum + basePrice
            }, 0).toLocaleString(),
            outputVat.toLocaleString()
          ],
          ['Input VAT (Purchases)', 
            purchasesData.reduce((sum, purchase) => {
              const { basePrice } = calculateVat(purchase.total, 'VAT_INCLUSIVE')
              return sum + basePrice
            }, 0).toLocaleString(),
            inputVat.toLocaleString()
          ],
          ['Net VAT', '', netVat.toLocaleString()]
        ]
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

    // Add currency indicator
    doc.text('Currency: TZS', { align: 'left' })
    doc.moveDown()

    // Add date range for non-stock reports
    if (type !== 'stock') {
      doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`)
      doc.moveDown()
    }

    // Add table
    const tableTop = doc.y
    let columnWidths = {
      sales: [80, 100, 160, 80, 80, 80],  // Date, Customer, Items, Base Price, VAT, Total
      stock: [150, 80, 80, 80],  // Product, Current Stock, Min Stock, Status
      purchases: [80, 100, 160, 80, 80, 80],  // Date, Supplier, Items, Base Price, VAT, Total
      customers: [120, 80, 80, 80, 100],  // Customer, Credit Limit, Total Credit, Total Paid, Outstanding Balance
      vat: [150, 120, 120]  // Type, Base Amount, VAT Amount
    }
    
    const currentWidths = columnWidths[type] || headers.map(() => 80)
    
    // Calculate total width and starting position
    const totalWidth = currentWidths.reduce((sum, width) => sum + width, 0)
    const startX = (doc.page.width - totalWidth) / 2
    
    // Calculate header row height based on content
    let maxHeaderHeight = 20 // minimum height
    headers.forEach((header, i) => {
      const headerWidth = currentWidths[i] - 10 // Account for padding
      const headerHeight = doc.heightOfString(header, { width: headerWidth })
      maxHeaderHeight = Math.max(maxHeaderHeight, headerHeight + 10) // Add padding
    })
    
    // Draw headers with borders
    headers.forEach((header, i) => {
      const x = startX + currentWidths.slice(0, i).reduce((sum, width) => sum + width, 0)
      // Draw cell border with dynamic height
      doc.rect(x, tableTop - 5, currentWidths[i], maxHeaderHeight).stroke()
      // Draw header text
      doc.text(header, x + 5, tableTop, {
        width: currentWidths[i] - 10,
        align: 'left'
      })
    })

    // Draw rows
    let y = tableTop + maxHeaderHeight
    rows.forEach((row) => {
      // Calculate required height for this row
      const itemsColumnIndex = 2  // Index of the Items column
      const itemsText = row[itemsColumnIndex]
      const itemsWidth = currentWidths[itemsColumnIndex] - 10  // Account for padding
      
      // Calculate height needed for items text
      doc.fontSize(12)
      const textHeight = doc.heightOfString(itemsText, { width: itemsWidth })
      const rowHeight = Math.max(20, textHeight + 10)  // Minimum 20, add padding
      
      let x = startX
      row.forEach((cell, i) => {
        // Draw cell border with dynamic height
        doc.rect(x, y - 5, currentWidths[i], rowHeight).stroke()
        // Draw cell content
        doc.text(cell, x + 5, y, {
          width: currentWidths[i] - 10,
          align: i >= headers.length - 3 ? 'right' : 'left' // Right align numbers
        })
        x += currentWidths[i]
      })
      y += rowHeight
      
      // Add a new page if we're near the bottom
      if (y > doc.page.height - 50) {
        doc.addPage()
        y = 50  // Reset Y position on new page
      }
    })

    // Add summary if applicable
    if (type === 'sales') {
      const total = data.reduce((sum, sale) => sum + sale.total, 0)
      doc.moveDown()
      // Calculate the position to align with the Total column
      const totalX = startX + currentWidths.slice(0, currentWidths.length - 1).reduce((sum, width) => sum + width, 0)
      doc.text(`Total Sales: TZS ${total.toLocaleString()}`, totalX, doc.y, {
        width: currentWidths[currentWidths.length - 1],
        align: 'right'
      })
    } else if (type === 'customer-credit') {
      const totalOutstanding = data.reduce((sum, customer) => sum + customer.outstandingBalance, 0)
      doc.moveDown()
      const totalX = startX + currentWidths.slice(0, currentWidths.length - 1).reduce((sum, width) => sum + width, 0)
      doc.text(`Total Outstanding Balance: TZS ${totalOutstanding.toLocaleString()}`, totalX, doc.y, {
        width: currentWidths[currentWidths.length - 1],
        align: 'right'
      })
    }

    doc.end()
  } catch (error) {
    console.error('Error generating report:', error)
    return res.status(500).json({ message: 'Error generating report' })
  }
} 
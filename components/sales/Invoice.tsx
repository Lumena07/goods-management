import { useRef } from 'react'

interface InvoiceProps {
  sale: {
    invoiceNumber: string
    createdAt: string
    dueDate: string
    customer: {
      name: string
      address?: string
    }
    items: {
      product: {
        name: string
      }
      quantity: number
      price: number
      discount: number
    }[]
    total: number
    basePrice: number
    vatAmount: number
  }
  companyInfo: {
    name: string
    address: string
    phone: string
    email: string
    website?: string
  }
}

export default function Invoice({ sale, companyInfo }: InvoiceProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (invoiceRef.current) {
      const printContents = invoiceRef.current.innerHTML
      const originalContents = document.body.innerHTML

      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white">
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Print Invoice
        </button>
      </div>

      <div ref={invoiceRef} className="p-8 border rounded">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">{companyInfo.name}</h1>
            <div className="text-gray-600">
              <p>{companyInfo.address}</p>
              <p>Phone: {companyInfo.phone}</p>
              <p>Email: {companyInfo.email}</p>
              {companyInfo.website && <p>Website: {companyInfo.website}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-2">INVOICE</h2>
            <p>Invoice #: {sale.invoiceNumber}</p>
            <p>Date: {new Date(sale.createdAt).toLocaleDateString()}</p>
            <p>Due Date: {new Date(sale.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-gray-600 mb-2">Bill To:</h3>
          <div className="font-medium">
            <p>{sale.customer.name}</p>
            {sale.customer.address && <p>{sale.customer.address}</p>}
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Discount</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, index) => {
              const subtotal = item.quantity * item.price
              const discountAmount = (subtotal * item.discount) / 100
              const total = subtotal - discountAmount

              return (
                <tr key={index} className="border-b border-gray-200">
                  <td className="py-2">{item.product.name}</td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    TZS {item.price.toLocaleString()}
                  </td>
                  <td className="text-right py-2">
                    {item.discount > 0 ? `${item.discount}%` : '-'}
                  </td>
                  <td className="text-right py-2">
                    TZS {total.toLocaleString()}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="text-right py-2">Subtotal:</td>
              <td className="text-right py-2">
                TZS {sale.basePrice.toLocaleString()}
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="text-right py-2">VAT Amount:</td>
              <td className="text-right py-2">
                TZS {sale.vatAmount.toLocaleString()}
              </td>
            </tr>
            <tr className="font-bold">
              <td colSpan={4} className="text-right py-4">Total:</td>
              <td className="text-right py-4">
                TZS {sale.total.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="border-t pt-8">
          <h4 className="font-bold mb-2">Terms and Conditions:</h4>
          <ol className="list-decimal list-inside text-sm text-gray-600">
            <li>Payment is due within 30 days</li>
            <li>Please include invoice number on your payment</li>
            <li>Make all checks payable to {companyInfo.name}</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 
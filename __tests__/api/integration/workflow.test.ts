import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { setupTestDatabase, prisma } from '../../setup/testSetup'
import supplierHandler from '@/pages/api/suppliers'
import purchaseHandler from '@/pages/api/purchases'
import purchaseDetailHandler from '@/pages/api/purchases/[id]'
import saleHandler from '@/pages/api/sales'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { role: 'ADMIN' } },
    status: 'authenticated'
  })
}))

// Unmock prisma for integration tests
jest.unmock('@/lib/prisma')

describe('Sale Workflow Integration', () => {
  let testData: any

  beforeAll(async () => {
    testData = await setupTestDatabase()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle complete sale workflow', async () => {
    // 1. Admin creates a purchase order
    const purchaseData = {
      supplierId: testData.supplier.id,
      items: [{
        productId: testData.product.id,
        quantity: 10,
        price: 80
      }]
    }

    const { req: purchaseReq, res: purchaseRes } = createMocks({
      method: 'POST',
      body: purchaseData
    })

    ;(getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { role: 'ADMIN' }
    })

    await purchaseHandler(purchaseReq, purchaseRes)
    expect(purchaseRes._getStatusCode()).toBe(201)

    const purchase = JSON.parse(purchaseRes._getData())
    
    // Log the purchase object to debug
    console.log('Purchase response:', purchase)

    // 2. Admin receives the purchase - wait for purchase item ID
    const purchaseItem = await prisma.purchaseItem.findFirst({
      where: { purchaseId: purchase.id }
    })

    const { req: receiveReq, res: receiveRes } = createMocks({
      method: 'PUT',
      query: { id: purchase.id },
      body: {
        status: 'RECEIVED',
        receivedItems: [{
          id: purchaseItem.id,  // Use the fetched item ID
          received: 10
        }]
      }
    })

    ;(getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { role: 'ADMIN' }
    })

    await purchaseDetailHandler(receiveReq, receiveRes)
    expect(receiveRes._getStatusCode()).toBe(200)

    // 3. Sales clerk creates a sale
    const saleData = {
      customerId: testData.customer.id,
      isAccredited: true,
      items: [{
        productId: testData.product.id,
        quantity: 5,
        price: 100
      }]
    }

    const { req: saleReq, res: saleRes } = createMocks({
      method: 'POST',
      body: saleData
    })

    ;(getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { role: 'SALES_CLERK' }
    })

    await saleHandler(saleReq, saleRes)
    expect(saleRes._getStatusCode()).toBe(201)

    // 4. Verify final stock level
    const updatedProduct = await prisma.product.findUnique({
      where: { id: testData.product.id }
    })

    expect(updatedProduct?.currentStock).toBe(25) // Initial 20 + 10 received - 5 sold
  })
}) 
import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { mockPrisma } from '../mocks/setup'
import purchaseHandler from '@/pages/api/purchases/[id]'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('Purchase Detail API', () => {
  const mockPurchase = {
    id: '1',
    supplierId: '1',
    total: 1000,
    status: 'PENDING',
    isPaid: false,
    supplier: {
      name: 'Test Supplier'
    },
    items: [
      {
        id: '1',
        productId: '1',
        quantity: 10,
        price: 100,
        received: 0,
        product: {
          name: 'Test Product'
        }
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/purchases/[id]', () => {
    it('returns purchase details for authenticated users', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.purchase.findUnique.mockResolvedValueOnce(mockPurchase)

      await purchaseHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockPurchase)
    })
  })

  describe('PUT /api/purchases/[id]', () => {
    it('updates purchase status and stock for admin users', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: '1' },
        body: {
          status: 'RECEIVED',
          receivedItems: [
            { id: '1', received: 10 }
          ]
        }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      mockPrisma.$transaction.mockResolvedValueOnce(mockPurchase)

      await purchaseHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toMatchObject(mockPurchase)
    })

    it('prevents non-admin users from updating purchases', async () => {
      const { req, res } = createMocks({
        method: 'PUT',
        query: { id: '1' },
        body: {
          status: 'RECEIVED',
          receivedItems: []
        }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      await purchaseHandler(req, res)
      expect(res._getStatusCode()).toBe(403)
    })
  })
}) 
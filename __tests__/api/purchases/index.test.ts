import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { mockPrisma } from '../mocks/setup'
import purchaseHandler from '@/pages/api/purchases/index'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('Purchases API', () => {
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

  describe('GET /api/purchases', () => {
    it('returns purchases list for authenticated users', async () => {
      const { req, res } = createMocks({ method: 'GET' })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.purchase.findMany.mockResolvedValueOnce([mockPurchase])

      await purchaseHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual([mockPurchase])
    })
  })

  describe('POST /api/purchases', () => {
    const newPurchase = {
      supplierId: '1',
      items: [
        {
          productId: '1',
          quantity: 10,
          price: 100
        }
      ]
    }

    it('creates purchase for authenticated users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: newPurchase
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.purchase.create.mockResolvedValueOnce(mockPurchase)

      await purchaseHandler(req, res)
      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject(mockPurchase)
    })
  })
}) 
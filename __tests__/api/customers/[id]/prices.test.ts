import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { mockPrisma } from '../../mocks/setup'
import pricesHandler from '@/pages/api/customers/[id]/prices/index'
import priceDeleteHandler from '@/pages/api/customers/[id]/prices/[priceId]'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('Customer Prices API', () => {
  const mockPrice = {
    id: '1',
    customerId: '1',
    productId: '1',
    price: 100,
    product: {
      name: 'Test Product',
      basePrice: 120
    },
    createdAt: '2025-01-08T11:15:14.303Z',
    updatedAt: '2025-01-08T11:15:14.303Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/customers/[id]/prices', () => {
    it('returns custom prices for authenticated users', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.customPrice.findMany.mockResolvedValueOnce([mockPrice])

      await pricesHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual([mockPrice])
    })
  })

  describe('POST /api/customers/[id]/prices', () => {
    const newPrice = {
      productId: '1',
      price: 90
    }

    it('creates custom price for admin users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        query: { id: '1' },
        body: newPrice
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      mockPrisma.customPrice.create.mockResolvedValueOnce({
        ...mockPrice,
        price: newPrice.price
      })

      await pricesHandler(req, res)
      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject({
        customerId: '1',
        ...newPrice
      })
    })
  })

  describe('DELETE /api/customers/[id]/prices/[priceId]', () => {
    it('deletes custom price for admin users', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1', priceId: '1' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      mockPrisma.customPrice.delete.mockResolvedValueOnce(mockPrice)

      await priceDeleteHandler(req, res)
      expect(res._getStatusCode()).toBe(204)
    })
  })
}) 
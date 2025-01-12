import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { mockPrisma } from '../../mocks/setup'
import statementHandler from '@/pages/api/customers/[id]/statement'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('Customer Statement API', () => {
  const mockSales = [
    {
      id: '1',
      customerId: '1',
      total: 1500,
      isPaid: true,
      createdAt: '2024-03-15T00:00:00.000Z',
      items: [
        {
          quantity: 2,
          price: 500,
          product: {
            name: 'Test Product'
          }
        }
      ]
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/customers/[id]/statement', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1', month: '2024-03' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      await statementHandler(req, res)
      expect(res._getStatusCode()).toBe(401)
    })

    it('returns monthly statement for authenticated users', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1', month: '2024-03' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.sale.findMany.mockResolvedValueOnce(mockSales)

      await statementHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual(mockSales)
    })

    it('handles invalid month parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1', month: 'invalid' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      await statementHandler(req, res)
      expect(res._getStatusCode()).toBe(400)
    })
  })
}) 
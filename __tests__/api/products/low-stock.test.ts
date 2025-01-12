import { mockPrisma } from '../mocks/setup'
import { createMocks } from 'node-mocks-http'
import lowStockHandler from '@/pages/api/products/low-stock'
import { getServerSession } from 'next-auth/next'

describe('Low Stock Products API', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Product',
      currentStock: 5,
      minimumStock: 10
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return low stock products', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    ;(getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { role: 'ADMIN' }
    })

    mockPrisma.product.findMany.mockResolvedValueOnce(mockProducts)

    await lowStockHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(mockProducts)
  })
}) 
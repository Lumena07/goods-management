import { mockPrisma } from '../mocks/setup'
import { createMocks } from 'node-mocks-http'
import metricsHandler from '@/pages/api/dashboard/metrics'
import { getServerSession } from 'next-auth/next'

describe('Dashboard Metrics API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 for unauthorized requests', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

    await metricsHandler(req, res)
    expect(res._getStatusCode()).toBe(401)
  })

  it('should return metrics for admin users', async () => {
    const { req, res } = createMocks({
      method: 'GET'
    })

    ;(getServerSession as jest.Mock).mockResolvedValueOnce({
      user: { role: 'ADMIN' }
    })

    const mockMetrics = {
      _sum: { total: 1000 }
    }

    mockPrisma.sale.aggregate.mockResolvedValueOnce(mockMetrics)
    mockPrisma.purchase.aggregate.mockResolvedValueOnce(mockMetrics)
    mockPrisma.payment.aggregate.mockResolvedValueOnce(mockMetrics)

    await metricsHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      totalSales: 1000,
      totalPurchases: 1000,
      outstandingBalance: 0
    })
  })
}) 
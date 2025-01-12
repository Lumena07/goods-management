import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { mockPrisma } from '../mocks/setup'
import customerHandler from '@/pages/api/customers/index'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('Customers API', () => {
  const mockCustomer = {
    id: '1',
    name: 'Test Customer',
    email: 'test@example.com',
    phone: '1234567890',
    address: 'Test Address',
    isAccredited: false,
    creditLimit: null,
    createdAt: '2025-01-08T11:15:13.431Z',
    updatedAt: '2025-01-08T11:15:13.431Z'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/customers', () => {
    it('returns 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({ method: 'GET' })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      await customerHandler(req, res)
      expect(res._getStatusCode()).toBe(401)
    })

    it('returns customers list for authenticated users', async () => {
      const { req, res } = createMocks({ method: 'GET' })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.customer.findMany.mockResolvedValueOnce([mockCustomer])

      await customerHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual([mockCustomer])
    })
  })

  describe('POST /api/customers', () => {
    const newCustomer = {
      name: 'New Customer',
      email: 'new@example.com',
      phone: '0987654321',
      address: 'New Address',
      isAccredited: true,
      creditLimit: 1000
    }

    it('returns 401 for unauthenticated requests', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: newCustomer
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce(null)

      await customerHandler(req, res)
      expect(res._getStatusCode()).toBe(401)
    })

    it('returns 403 for non-admin users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: newCustomer
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      await customerHandler(req, res)
      expect(res._getStatusCode()).toBe(403)
    })

    it('creates customer for admin users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: newCustomer
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      mockPrisma.customer.create.mockResolvedValueOnce({
        ...newCustomer,
        id: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await customerHandler(req, res)
      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject(newCustomer)
    })
  })
}) 
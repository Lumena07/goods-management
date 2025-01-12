import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import { mockPrisma } from '../mocks/setup'
import productHandler from '@/pages/api/products/index'
import productIdHandler from '@/pages/api/products/[id]'

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('Products API', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    basePrice: 100,
    minStock: 10,
    currentStock: 15,
    createdAt: new Date('2025-01-09T05:28:23.998Z'),
    updatedAt: new Date('2025-01-09T05:28:23.998Z')
  }

  // Custom matcher that ignores date format differences
  expect.extend({
    toEqualIgnoringDateFormat(received, expected) {
      const normalizeDate = (obj: any) => {
        const copy = { ...obj }
        if (copy.createdAt) {
          copy.createdAt = new Date(copy.createdAt).toISOString()
        }
        if (copy.updatedAt) {
          copy.updatedAt = new Date(copy.updatedAt).toISOString()
        }
        return copy
      }

      const normalizedReceived = Array.isArray(received) 
        ? received.map(normalizeDate)
        : normalizeDate(received)
      
      const normalizedExpected = Array.isArray(expected)
        ? expected.map(normalizeDate)
        : normalizeDate(expected)

      return {
        pass: this.equals(normalizedReceived, normalizedExpected),
        message: () => `expected ${received} to equal ${expected} ignoring date format`
      }
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('returns products list for authenticated users', async () => {
      const { req, res } = createMocks({ method: 'GET' })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      mockPrisma.product.findMany.mockResolvedValueOnce([mockProduct])

      await productHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqualIgnoringDateFormat([mockProduct])
    })
  })

  describe('POST /api/products', () => {
    const newProduct = {
      name: 'New Product',
      basePrice: 100,
      minStock: 10,
      currentStock: 15
    }

    it('creates product for admin users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: newProduct
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      mockPrisma.product.create.mockResolvedValueOnce({
        ...newProduct,
        id: '2',
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await productHandler(req, res)
      expect(res._getStatusCode()).toBe(201)
      expect(JSON.parse(res._getData())).toMatchObject(newProduct)
    })

    it('returns 403 for non-admin users', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: newProduct
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      await productHandler(req, res)
      expect(res._getStatusCode()).toBe(403)
    })
  })

  describe('GET /api/products/[id]', () => {
    it('returns product details with custom prices', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: { id: '1' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      const expectedProduct = {
        ...mockProduct,
        customPrices: [],
        supplierPrices: []
      }

      mockPrisma.product.findUnique.mockResolvedValueOnce(expectedProduct)

      await productIdHandler(req, res)
      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqualIgnoringDateFormat(expectedProduct)
    })
  })

  describe('DELETE /api/products/[id]', () => {
    it('deletes product for admin users', async () => {
      const { req, res } = createMocks({
        method: 'DELETE',
        query: { id: '1' }
      })
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      mockPrisma.product.delete.mockResolvedValueOnce(mockProduct)

      await productIdHandler(req, res)
      expect(res._getStatusCode()).toBe(204)
    })
  })
}) 
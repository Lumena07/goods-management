import { createMocks } from 'node-mocks-http'
import salesHandler from '@/pages/api/sales'
import { setupTestDatabase } from '../../setup/testSetup'

describe('Sales API', () => {
  let testData: any

  beforeAll(async () => {
    testData = await setupTestDatabase()
  })

  it('creates a new sale', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: testData.customer.id,
        items: [{
          productId: testData.product.id,
          quantity: 5,
          price: 100,
          discount: 0
        }]
      }
    })

    await salesHandler(req, res)
    expect(res._getStatusCode()).toBe(201)
  })

  it('validates required fields', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        items: [] // Missing required items
      }
    })

    await salesHandler(req, res)
    expect(res._getStatusCode()).toBe(400)
  })

  it('checks stock availability', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        customerId: testData.customer.id,
        items: [{
          productId: testData.product.id,
          quantity: 1000, // More than available stock
          price: 100
        }]
      }
    })

    await salesHandler(req, res)
    expect(res._getStatusCode()).toBe(400)
  })
}) 
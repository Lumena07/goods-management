import { createMocks } from 'node-mocks-http'
import bcrypt from 'bcryptjs'
import createHandler from '../../pages/api/users/create'
import { getServerSession } from 'next-auth/next'
//import { sendWelcomeEmail } from '@/lib/email'
import { mockPrisma } from './mocks/setup'

jest.mock('next-auth', () => {
  return {
    __esModule: true,
    default: jest.fn(() => null)
  }
})

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

// Mock the email service
jest.mock('@/lib/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined)
}))

describe('Authentication API', () => {
  beforeEach(() => {
    mockPrisma.user.findUnique.mockResolvedValueOnce({
      id: '1',
      email: 'test@example.com',
      role: 'SALES_CLERK',
      isApproved: true
    })
  })

  describe('User Creation (POST /api/users/create)', () => {
    it('should create a user when requested by an admin', async () => {
      // Mock admin session
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'ADMIN' }
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'SALES_CLERK',
          password: 'password123'
        }
      })

      await createHandler(req, res)

      expect(res._getStatusCode()).toBe(201)
      
      // Verify user was created in database
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'test@example.com',
          role: 'SALES_CLERK'
        })
      })
    })

    it('should reject user creation when requested by a non-admin', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { role: 'SALES_CLERK' }
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'Test User',
          email: 'test@example.com',
          role: 'SALES_CLERK'
        }
      })

      await createHandler(req, res)

      expect(res._getStatusCode()).toBe(403)
    })
  })
}) 
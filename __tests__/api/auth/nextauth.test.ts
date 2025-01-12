import { createMocks } from 'node-mocks-http'
import { getServerSession } from 'next-auth/next'
import authHandler from '@/pages/api/auth/[...nextauth]'

describe('NextAuth', () => {
  it('handles credentials login', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        username: 'test@example.com',
        password: 'password123'
      }
    })

    await authHandler(req, res)
    expect(res._getStatusCode()).toBe(200)
  })

  it('rejects invalid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        username: 'test@example.com',
        password: 'wrongpassword'
      }
    })

    await authHandler(req, res)
    expect(res._getStatusCode()).toBe(401)
  })

  it('checks user approval status', async () => {
    // Test unapproved user login attempt
  })
}) 
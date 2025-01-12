import { createMocks } from 'node-mocks-http'
import { NextResponse } from 'next/server'
import middleware from '../middleware'

jest.mock('next-auth/middleware', () => ({
  withAuth: (fn) => fn
}))

describe('Middleware', () => {
  it('should allow admin access to admin routes', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/admin/users'
    })

    req.nextauth = { token: { role: 'ADMIN' } }
    req.nextUrl = new URL('http://localhost:3000/admin/users')

    const response = await middleware(req)
    expect(response).toEqual(NextResponse.next())
  })

  it('should redirect non-admin users from admin routes', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/admin/users'
    })

    req.nextauth = { token: { role: 'SALES_CLERK' } }
    req.url = 'http://localhost:3000/admin/users'
    req.nextUrl = new URL(req.url)

    const response = await middleware(req)
    expect(response?.status).toBe(307)
    expect(response?.headers.get('Location')).toContain('/unauthorized')
  })

  it('should allow sales clerk access to sales routes', async () => {
    const { req } = createMocks({
      method: 'GET',
      url: '/sales/orders'
    })

    req.nextauth = { token: { role: 'SALES_CLERK' } }
    req.nextUrl = new URL('http://localhost:3000/sales/orders')

    const response = await middleware(req)
    expect(response).toEqual(NextResponse.next())
  })
}) 
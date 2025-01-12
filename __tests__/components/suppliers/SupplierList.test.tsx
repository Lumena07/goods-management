import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import SupplierList from '@/components/suppliers/SupplierList'

// Mock next-auth
jest.mock('next-auth/react')
const mockUseSession = useSession as jest.Mock

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn()
    }
  })
}))

describe('SupplierList', () => {
  const mockSuppliers = [
    {
      id: '1',
      name: 'Test Supplier',
      email: 'test@example.com',
      phone: '1234567890',
      address: 'Test Address',
      prices: [
        {
          id: '1',
          price: 90,
          product: {
            name: 'Product A',
            basePrice: 100
          }
        }
      ]
    }
  ]

  beforeEach(() => {
    // Set up default session mock for all tests
    mockUseSession.mockReturnValue({
      data: { user: { role: 'SALES_CLERK' } },
      status: 'authenticated'
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockSuppliers)
    })
  })

  afterEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('renders supplier list with data', async () => {
    render(<SupplierList />)

    await waitFor(() => {
      expect(screen.getByText('Test Supplier')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('1234567890')).toBeInTheDocument()
      expect(screen.getByText('Product A @ TZS 90')).toBeInTheDocument()
    })
  })

  it('shows add supplier button only for admin users', async () => {
    // First render with admin user
    mockUseSession.mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })

    render(<SupplierList />)
    
    await waitFor(() => {
      expect(screen.getByText('Add Supplier')).toBeInTheDocument()
    })

    cleanup()

    // Second render with sales clerk
    mockUseSession.mockReturnValue({
      data: { user: { role: 'SALES_CLERK' } },
      status: 'authenticated'
    })

    render(<SupplierList />)

    await waitFor(() => {
      expect(screen.queryByText('Add Supplier')).not.toBeInTheDocument()
    })
  })

  it('handles delete supplier for admin users', async () => {
    window.confirm = jest.fn(() => true)

    // Mock session as admin user
    mockUseSession.mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })

    render(<SupplierList />)

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/suppliers/1', {
        method: 'DELETE'
      })
    })
  })
}) 
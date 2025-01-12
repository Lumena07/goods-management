import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import CustomerList from '@/components/customers/CustomerList'

jest.mock('next-auth/react')

describe('CustomerList', () => {
  const mockCustomers = [
    {
      id: '1',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890',
      isAccredited: true,
      creditLimit: 1000
    }
  ]

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCustomers)
    })

    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })
  })

  it('renders customer list with data', async () => {
    render(<CustomerList />)

    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('Accredited')).toBeInTheDocument()
      expect(screen.getByText('TZS 1,000')).toBeInTheDocument()
    })
  })

  it('shows add customer button only for admin users', async () => {
    await act(async () => {
      render(<CustomerList />)
    })
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
    
    expect(screen.getByText('Add Customer')).toBeInTheDocument()
  })

  it('handles delete customer for admin users', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCustomers
      })
      .mockResolvedValueOnce({
        ok: true
      })

    window.confirm = jest.fn(() => true)

    render(<CustomerList />)

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/customers/1', {
        method: 'DELETE'
      })
    })
  })
}) 
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import StatementView from '@/components/customers/StatementView'

describe('StatementView', () => {
  const mockSales = [
    {
      id: '1',
      total: 1500,
      isPaid: true,
      createdAt: '2024-03-15T10:00:00Z',
      items: [
        {
          quantity: 2,
          price: 500,
          product: { name: 'Product A' }
        },
        {
          quantity: 1,
          price: 500,
          product: { name: 'Product B' }
        }
      ]
    },
    {
      id: '2',
      total: 1000,
      isPaid: false,
      createdAt: '2024-03-16T10:00:00Z',
      items: [
        {
          quantity: 2,
          price: 500,
          product: { name: 'Product C' }
        }
      ]
    }
  ]

  beforeEach(() => {
    global.fetch = jest.fn()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockSales
    })
  })

  it('renders statement with sales data', async () => {
    await act(async () => {
      render(<StatementView customerId="1" month="2024-03" />)
    })

    await waitFor(() => {
      expect(screen.getByTestId('total-amount')).toHaveTextContent('TZS 2,500')
    })
  })

  it('handles month selection', async () => {
    await act(async () => {
      render(<StatementView customerId="1" />)
    })

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })

    await act(async () => {
      fireEvent.change(screen.getByLabelText('Select Month'), { 
        target: { value: '2024-04' } 
      })
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('month=2024-04')
      )
    })
  })

  it('handles print statement', async () => {
    global.print = jest.fn()
    
    await act(async () => {
      render(<StatementView customerId="1" month="2024-03" />)
    })

    await waitFor(() => {
      fireEvent.click(screen.getByText('Print Statement'))
      expect(global.print).toHaveBeenCalled()
    })
  })

  it('displays loading state', async () => {
    // Create a promise that won't resolve immediately
    let resolvePromise: (value: unknown) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    // Mock fetch to return our delayed promise
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => promise)

    await act(async () => {
      render(<StatementView customerId="1" />)
    })

    // Check for loading state before resolving the promise
    expect(screen.getByText('Loading...')).toBeInTheDocument()

    // Clean up by resolving the promise
    await act(async () => {
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve(mockSales)
      })
    })
  })

  it('handles fetch error gracefully', async () => {
    console.error = jest.fn()
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Fetch failed'))

    await act(async () => {
      render(<StatementView customerId="1" />)
    })

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching statement:',
        expect.any(Error)
      )
    })
  })
}) 
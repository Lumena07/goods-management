import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import CustomPriceList from '@/components/customers/CustomPriceList'

jest.mock('next-auth/react')

describe('CustomPriceList', () => {
  const mockPrices = [
    {
      id: '1',
      productId: '1',
      price: 90,
      product: {
        name: 'Product A',
        basePrice: 100
      }
    },
    {
      id: '2',
      productId: '2',
      price: 180,
      product: {
        name: 'Product B',
        basePrice: 200
      }
    }
  ]

  const mockProducts = [
    { id: '1', name: 'Product A' },
    { id: '2', name: 'Product B' },
    { id: '3', name: 'Product C' }
  ]

  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/prices')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPrices)
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      })
    })

    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })
  })

  it('renders custom prices list', async () => {
    render(<CustomPriceList customerId="1" />)

    await waitFor(() => {
      const rows = screen.getAllByRole('row')
      expect(rows[1]).toHaveTextContent('Product A')
      expect(rows[1]).toHaveTextContent('TZS 100')
      expect(rows[1]).toHaveTextContent('TZS 90')

      expect(rows[2]).toHaveTextContent('Product B')
      expect(rows[2]).toHaveTextContent('TZS 200')
      expect(rows[2]).toHaveTextContent('TZS 180')

      const select = screen.getByTestId('product-select')
      expect(select).toBeInTheDocument()
    })
  })

  it('shows add price form only for admin users', async () => {
    const { unmount } = render(<CustomPriceList customerId="1" />)
    await waitFor(() => {
      expect(screen.getByText('Add Custom Price')).toBeInTheDocument()
    })

    // Clean up first render
    unmount()

    // Update session mock
    ;(useSession as jest.Mock).mockReturnValue({
      data: { user: { role: 'SALES_CLERK' } },
      status: 'authenticated'
    })

    // Re-render with new session
    render(<CustomPriceList customerId="1" />)
    await waitFor(() => {
      expect(screen.queryByText('Add Custom Price')).not.toBeInTheDocument()
    })
  })

  it('handles adding new custom price', async () => {
    const newPrice = {
      productId: '3',
      price: 150
    }

    render(<CustomPriceList customerId="1" />)

    await waitFor(() => {
      fireEvent.change(screen.getByTestId('product-select'), {
        target: { value: newPrice.productId }
      })
      fireEvent.change(screen.getByLabelText(/price/i), {
        target: { value: newPrice.price }
      })
    })

    fireEvent.click(screen.getByText('Add Custom Price'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/customers/1/prices',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPrice)
        })
      )
    })
  })

  it('handles delete custom price', async () => {
    render(<CustomPriceList customerId="1" />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete')
      fireEvent.click(deleteButtons[0])
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/customers/1/prices/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })
}) 
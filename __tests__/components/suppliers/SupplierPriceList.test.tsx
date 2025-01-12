import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import SupplierPriceList from '@/components/suppliers/SupplierPriceList'

jest.mock('next-auth/react')
const mockUseSession = useSession as jest.Mock

describe('SupplierPriceList', () => {
  const mockPrices = [
    {
      id: '1',
      productId: '1',
      price: 90,
      product: {
        id: '1',
        name: 'Product A',
        basePrice: 100
      }
    }
  ]

  const mockProducts = [
    { id: '1', name: 'Product A', basePrice: 100 },
    { id: '2', name: 'Product B', basePrice: 200 }
  ]

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProducts)
    })

    // Default to non-admin user
    mockUseSession.mockReturnValue({
      data: { user: { role: 'SALES_CLERK' } },
      status: 'authenticated'
    })
  })

  it('renders price list with data', async () => {
    render(<SupplierPriceList supplierId="1" prices={mockPrices} />)

    expect(screen.getByText('Product A')).toBeInTheDocument()
    expect(screen.getByText('TZS 90')).toBeInTheDocument()
    expect(screen.getByText('TZS 100')).toBeInTheDocument()
  })

  it('shows add price form only for admin users', async () => {
    // First render with non-admin user (using default from beforeEach)
    render(<SupplierPriceList supplierId="1" prices={mockPrices} />)
    expect(screen.queryByText('Add Price')).not.toBeInTheDocument()

    // Clean up
    cleanup()

    // Second render with admin user
    mockUseSession.mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })

    render(<SupplierPriceList supplierId="1" prices={mockPrices} />)
    expect(screen.getByText('Add Price')).toBeInTheDocument()
  })

  it('handles adding new price', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })

    render(<SupplierPriceList supplierId="1" prices={mockPrices} />)

    // Click Add Price button and wait for form to appear
    fireEvent.click(screen.getByRole('button', { name: /add price/i }))
    
    await waitFor(() => {
      expect(screen.getByTestId('product-select')).toBeInTheDocument()
    })

    const select = screen.getByTestId('product-select')
    fireEvent.focus(select)

    const newPrice = {
      productId: '2',
      price: 180
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProducts)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: '2',
          ...newPrice,
          product: {
            name: 'Product B',
            basePrice: 200
          }
        })
      })

    await waitFor(() => {
      expect(screen.getByText('Product B')).toBeInTheDocument()
    })

    fireEvent.change(select, { target: { value: newPrice.productId } })
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: newPrice.price }
    })

    fireEvent.click(screen.getByText('Add Price'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/suppliers/1/prices',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(newPrice)
        })
      )
    })
  })

  it('handles delete price', async () => {
    window.confirm = jest.fn(() => true)

    mockUseSession.mockReturnValue({
      data: { user: { role: 'ADMIN' } },
      status: 'authenticated'
    })

    render(<SupplierPriceList supplierId="1" prices={mockPrices} />)

    // Wait for and click delete button
    const deleteButton = await screen.findByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/suppliers/1/prices/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })
}) 
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { withRouter } from '../../utils/test-utils'
import SaleForm from '@/components/sales/SaleForm'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { role: 'ADMIN' } },
    status: 'authenticated'
  })
}))

describe('SaleForm Integration', () => {
  const mockCustomer = {
    id: '1',
    name: 'Test Customer',
    isAccredited: true
  }

  const mockProduct = {
    id: '1',
    name: 'Test Product',
    basePrice: 100,
    currentStock: 20
  }

  beforeEach(() => {
    // Mock fetch for products and customers
    global.fetch = jest.fn().mockImplementation((url) => {
      console.log('Fetching:', url)
      if (url.includes('/customers')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockCustomer])
        })
      }
      if (url.includes('/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockProduct])
        })
      }
      return Promise.reject(new Error(`Unhandled fetch to ${url}`))
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders and handles form submission', async () => {
    render(withRouter(<SaleForm />))

    // Wait for initial customer data to load
    await waitFor(() => {
      expect(screen.getByText('Test Customer')).toBeInTheDocument()
    })

    // Click Add Item to show product selection
    fireEvent.click(screen.getByText('Add Item'))

    // Now wait for product to be visible in dropdown
    await waitFor(() => {
      expect(screen.getByText('Test Product (20 in stock)')).toBeInTheDocument()
    })

    // Select customer - get the first select element
    const customerSelect = screen.getAllByRole('combobox')[0]
    fireEvent.change(customerSelect, {
      target: { value: mockCustomer.id }
    })

    // Add product - get the second select element
    const productSelect = screen.getAllByRole('combobox')[1]
    fireEvent.change(productSelect, {
      target: { value: mockProduct.id }
    })

    // Set quantity - find by spinbutton role
    const quantityInput = screen.getAllByRole('spinbutton')[0] // first number input is quantity
    fireEvent.change(quantityInput, {
      target: { value: '5' }
    })

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create sale/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/sales', expect.any(Object))
    })
  })
}) 
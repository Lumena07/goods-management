import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import ProductForm from '@/components/products/ProductForm'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('ProductForm', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn()
  }

  beforeEach(() => {
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    global.fetch = jest.fn()
  })

  it('renders empty form for new product', () => {
    render(<ProductForm />)

    expect(screen.getByLabelText(/name/i)).toHaveValue('')
    expect(screen.getByLabelText(/base price/i)).toHaveValue(null)
    expect(screen.getByLabelText(/minimum stock/i)).toHaveValue(0)
    expect(screen.getByLabelText(/current stock/i)).toHaveValue(0)
  })

  it('renders form with product data for editing', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      basePrice: 100,
      minStock: 10,
      currentStock: 20
    }

    render(<ProductForm product={product} />)

    expect(screen.getByLabelText(/name/i)).toHaveValue(product.name)
    expect(screen.getByLabelText(/base price/i)).toHaveValue(product.basePrice)
    expect(screen.getByLabelText(/minimum stock/i)).toHaveValue(product.minStock)
    expect(screen.getByLabelText(/current stock/i)).toHaveValue(product.currentStock)
  })

  it('submits form data correctly for new product', async () => {
    const newProduct = {
      name: 'New Product',
      basePrice: '100',
      minStock: '10',
      currentStock: '15'
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true
    })

    render(<ProductForm />)

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: newProduct.name }
    })
    fireEvent.change(screen.getByLabelText(/base price/i), {
      target: { value: newProduct.basePrice }
    })
    fireEvent.change(screen.getByLabelText(/minimum stock/i), {
      target: { value: newProduct.minStock }
    })
    fireEvent.change(screen.getByLabelText(/current stock/i), {
      target: { value: newProduct.currentStock }
    })

    fireEvent.submit(screen.getByTestId('product-form'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newProduct,
          basePrice: parseFloat(newProduct.basePrice),
          minStock: parseInt(newProduct.minStock),
          currentStock: parseInt(newProduct.currentStock)
        })
      })
      expect(mockRouter.push).toHaveBeenCalledWith('/products')
    })
  })

  it('handles form cancellation', () => {
    render(<ProductForm />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(mockRouter.back).toHaveBeenCalled()
  })
}) 
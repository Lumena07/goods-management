import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { calculateVat, formatVatAmount, getVatBreakdown } from '@/lib/utils/vat'
import { Checkbox } from "@/components/ui/checkbox"
import { Toast } from "@/components/ui/toast"
type VatPreference = 'VAT_INCLUSIVE' | 'VAT_EXCLUSIVE'
interface Product {
  id: string
  name: string
  basePrice: number
  currentStock: number
  minStock: number
  customPrices: Array<{
    customerId: string
    price: number
  }>
}

interface Customer {
  id: string
  name: string
  isAccredited: boolean
  vatPreference: VatPreference
}

interface SaleItem {
  productId: string
  quantity: number
  price: number
  discount: number
}

interface SaleFormProps {
  onSubmit: (data: any) => void
}

export default function SaleForm({ onSubmit }: SaleFormProps) {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerVatPreference, setCustomerVatPreference] = useState<VatPreference>('VAT_INCLUSIVE')
  const [items, setItems] = useState<SaleItem[]>([])
  const [isAccredited, setIsAccredited] = useState(false)
  const [error, setError] = useState('')
  const [showError, setShowError] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          fetch('/api/products?filterByStock=true'),
          fetch('/api/customers')
        ])
        
        if (productsRes.ok && customersRes.ok) {
          const [productsData, customersData] = await Promise.all([
            productsRes.json(),
            customersRes.json()
          ])
          console.log('Fetched products with custom prices:', productsData)
          setProducts(productsData)
          setCustomers(customersData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      setCustomerVatPreference(selectedCustomer.vatPreference)
      setIsAccredited(selectedCustomer.isAccredited)
    }
  }, [selectedCustomer])

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, discount: 0 }])
  }

  const handleItemChange = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    if (field === 'productId' && selectedCustomer && products?.length > 0) {
      const product = products.find(p => p.id === value)
      if (product) {
        const customPrice = product.customPrices?.find(cp => cp.customerId === selectedCustomer.id)
        if (customPrice) {
          newItems[index].price = customPrice.price
        } else {
          newItems[index].price = product.basePrice
        }
      }
    }

    // Check if quantity would bring stock below minimum
    if (field === 'quantity' && newItems[index].productId) {
      const product = products.find(p => p.id === newItems[index].productId)
      if (product) {
        const availableStock = product.currentStock - product.minStock
        if (value > availableStock) {
          setError(`Warning: Cannot sell ${value} units of ${product.name}. Available stock is ${availableStock} units (current stock: ${product.currentStock}, minimum stock: ${product.minStock})`)
          setShowError(true)
          return
        }
      }
    }

    setItems(newItems)
    setError('')
    setShowError(false)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateItemTotal = (item: SaleItem) => {
    const subtotal = item.quantity * item.price;
    const discountAmount = (subtotal * (item.discount || 0)) / 100;
    const afterDiscount = subtotal - discountAmount;
    const { totalPrice } = calculateVat(afterDiscount, customerVatPreference);
    return totalPrice;
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const calculatedItems = items.map(item => {
        const subtotal = item.quantity * item.price;
        const discountAmount = (subtotal * (item.discount || 0)) / 100;
        const afterDiscount = subtotal - discountAmount;
        const { basePrice, vatAmount, totalPrice } = calculateVat(afterDiscount, customerVatPreference);
        
        return {
          ...item,
          quantity: parseInt(item.quantity.toString()),
          price: parseFloat(item.price.toString()),
          discount: parseFloat(item.discount.toString()),
          basePrice,
          vatAmount,
          total: totalPrice
        }
      });

      const saleTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const saleBasePrice = calculatedItems.reduce((sum, item) => sum + item.basePrice, 0);
      const saleVatAmount = calculatedItems.reduce((sum, item) => sum + item.vatAmount, 0);

      onSubmit({
        customerId: selectedCustomer?.id,
        isAccredited,
        items: calculatedItems,
        total: saleTotal,
        basePrice: saleBasePrice,
        vatAmount: saleVatAmount
      })
    }}>
      {showError && (
        <Toast
          message={error}
          type="warning"
          onClose={() => setShowError(false)}
        />
      )}
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Label htmlFor="customer" className="block mb-2">Customer</Label>
          <Select
            value={selectedCustomer?.id || ''}
            onValueChange={(value) => {
              const customer = customers.find(c => c.id === value)
              setSelectedCustomer(customer || null)
              
              if (customer) {
                setItems(prevItems => prevItems.map(item => {
                  if (!item.productId) return item
                  
                  const product = products.find(p => p.id === item.productId)
                  if (!product) return item

                  const customPrice = product.customPrices?.find(cp => cp.customerId === customer.id)
                  if (customPrice) {
                    return {
                      ...item,
                      price: customPrice.price
                    }
                  } else {
                    return {
                      ...item,
                      price: product.basePrice
                    }
                  }
                }))
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              {filteredCustomers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCustomer?.isAccredited && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isAccredited"
                checked={isAccredited}
                onCheckedChange={(checked) => setIsAccredited(checked as boolean)}
              />
              <Label htmlFor="isAccredited">Create as Accredited Sale</Label>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg">Items</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              className="whitespace-nowrap"
            >
              Add Item
            </Button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div>
                  <Label className="block mb-2">Product</Label>
                  <Select
                    value={item.productId}
                    onValueChange={(value) => handleItemChange(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      {filteredProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} (Stock: {product.currentStock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="block mb-2">Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                      placeholder="Quantity"
                      min="1"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="block mb-2">Price (TZS)</Label>
                    <Input
                      type="number"
                      value={item.price}
                      disabled
                      className="w-full bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="block mb-2">Discount (%)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                        placeholder="Discount %"
                        min="0"
                        max="100"
                        className="w-full"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        className="flex-shrink-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="w-full sm:w-1/2 ml-auto space-y-2 text-sm text-gray-600">
            {items.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatVatAmount(items.reduce((sum, item) => {
                    const itemTotal = item.quantity * item.price;
                    const { basePrice } = calculateVat(itemTotal, customerVatPreference);
                    return sum + basePrice;
                  }, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Amount:</span>
                  <span>{formatVatAmount(items.reduce((sum, item) => {
                    const itemTotal = item.quantity * item.price;
                    const { vatAmount } = calculateVat(itemTotal, customerVatPreference);
                    return sum + vatAmount;
                  }, 0))}</span>
                </div>
                {items.some(item => item.discount > 0) && (
                  <div className="flex justify-between text-red-600">
                    <span>Total Discounts:</span>
                    <span>-{formatVatAmount(items.reduce((sum, item) => {
                      const itemTotal = item.quantity * item.price;
                      const { basePrice } = calculateVat(itemTotal, customerVatPreference);
                      return sum + (basePrice * (item.discount || 0) / 100);
                    }, 0))}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                  <span>Total:</span>
                  <span>{formatVatAmount(calculateTotal())}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="w-full sm:w-auto"
          >
            Create Sale
          </Button>
        </div>
      </div>
    </form>
  )
} 

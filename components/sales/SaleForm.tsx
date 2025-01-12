import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { calculateVat, formatVatAmount, getVatBreakdown } from '@/lib/utils/vat'
import { Checkbox } from "@/components/ui/checkbox"
type VatPreference = 'VAT_INCLUSIVE' | 'VAT_EXCLUSIVE'
interface Product {
  id: string
  name: string
  basePrice: number
  currentStock: number
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, customersRes] = await Promise.all([
          fetch('/api/products'),
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

    setItems(newItems)
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
      <div className="space-y-4">
        <div>
          <Label htmlFor="customer">Customer</Label>
          <Select
            value={selectedCustomer?.id || ''}
            onValueChange={(value) => {
              const customer = customers.find(c => c.id === value)
              console.log('Selected customer:', customer)
              setSelectedCustomer(customer || null)
              
              if (customer) {
                setItems(prevItems => prevItems.map(item => {
                  if (!item.productId) return item
                  
                  const product = products.find(p => p.id === item.productId)
                  console.log('Checking product for custom price:', product)
                  if (!product) return item

                  const customPrice = product.customPrices?.find(cp => cp.customerId === customer.id)
                  console.log('Custom price found for this customer:', customPrice)
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
            <SelectTrigger>
              <SelectValue placeholder="Select a customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCustomer?.isAccredited && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAccredited"
              checked={isAccredited}
              onCheckedChange={(checked) => setIsAccredited(checked as boolean)}
            />
            <Label htmlFor="isAccredited">Create as Accredited Sale</Label>
          </div>
        )}

        <div className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <Label className="text-lg">Items</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 mt-2">
              <div className="col-span-5">
                <Label>Product</Label>
                <Select
                  value={item.productId}
                  onValueChange={(value) => handleItemChange(index, 'productId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  placeholder="Quantity"
                  min="1"
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Label>Price (TZS)</Label>
                <Input
                  type="number"
                  value={item.price}
                  disabled
                  className="w-full bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div className="col-span-2">
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={item.discount}
                  onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value))}
                  placeholder="Discount %"
                  min="0"
                  max="100"
                  className="w-full"
                />
              </div>
              <div className="col-span-1 flex items-center justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveItem(index)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-t pt-4">
          <div className="flex justify-end">
            <div className="w-1/3 space-y-2 text-sm text-gray-600 border rounded-md p-4 bg-gray-50">
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
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            Create Sale
          </Button>
        </div>
      </div>
    </form>
  )
} 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { calculateVat, formatVatAmount, getVatBreakdown } from '@/lib/utils/vat'

type VatPreference = 'VAT_INCLUSIVE' | 'VAT_EXCLUSIVE'

interface Supplier {
  id: string
  name: string
  vatPreference: VatPreference
}

interface Product {
  id: string
  name: string
  basePrice: number
}

interface PurchaseItem {
  productId: string
  quantity: number
  price: number
}

interface SupplierPrice {
  productId: string
  price: number
  product: {
    name: string
  }
}

interface PurchaseFormProps {
  supplier?: {
    id: string
    name: string
    email: string | null
    phone: string
    address: string | null
    vatPreference: VatPreference
  }
  onSubmit: (data: any) => void
}

export default function PurchaseForm({ supplier, onSubmit }: PurchaseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState(supplier?.id || '')
  const [supplierVatPreference, setSupplierVatPreference] = useState<VatPreference>('VAT_INCLUSIVE')
  const [supplierPrices, setSupplierPrices] = useState<SupplierPrice[]>([])
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [productSearch, setProductSearch] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/products')
        ])
        const [suppliersData, productsData] = await Promise.all([
          suppliersRes.json(),
          productsRes.json()
        ])
        setSuppliers(suppliersData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (selectedSupplier) {
      const supplier = suppliers.find(s => s.id === selectedSupplier)
      if (supplier) {
        setSupplierVatPreference(supplier.vatPreference)
      }

      const fetchPrices = async () => {
        try {
          const response = await fetch(`/api/suppliers/${selectedSupplier}/prices`)
          const data = await response.json()
          setSupplierPrices(Array.isArray(data) ? data : [])
        } catch (error) {
          console.error('Error fetching supplier prices:', error)
          setSupplierPrices([])
        }
      }
      fetchPrices()
    }
  }, [selectedSupplier, suppliers])

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0 }])
  }

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items]
    if (field === 'productId') {
      const supplierPrice = supplierPrices.find(sp => sp.productId === value)
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        price: supplierPrice?.price || 0
      }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateItemTotal = (item: PurchaseItem) => {
    const subtotal = item.quantity * item.price
    const { totalPrice } = calculateVat(subtotal, supplierVatPreference)
    return totalPrice
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  if (loading) return <div>Loading...</div>

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const calculatedItems = items.map(item => {
        const subtotal = item.quantity * item.price;
        const { basePrice, vatAmount, totalPrice } = calculateVat(subtotal, supplierVatPreference);
        
        return {
          ...item,
          quantity: parseInt(item.quantity.toString()),
          price: parseFloat(item.price.toString()),
          basePrice,
          vatAmount,
          total: totalPrice
        }
      });

      const purchaseTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const purchaseBasePrice = calculatedItems.reduce((sum, item) => sum + item.basePrice, 0);
      const purchaseVatAmount = calculatedItems.reduce((sum, item) => sum + item.vatAmount, 0);

      onSubmit({
        supplierId: selectedSupplier,
        items: calculatedItems,
        total: purchaseTotal,
        basePrice: purchaseBasePrice,
        vatAmount: purchaseVatAmount
      })
    }}>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Label htmlFor="supplier" className="block mb-2">Supplier</Label>
          <Select
            value={selectedSupplier}
            onValueChange={(value) => setSelectedSupplier(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="Search suppliers..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="mb-2"
                />
              </div>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                      {supplierPrices.map(supplierPrice => (
                        <SelectItem key={supplierPrice.productId} value={supplierPrice.productId}>
                          {supplierPrice.product.name}
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
                      className="w-full bg-gray-50"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="block mb-2">&nbsp;</Label>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => handleRemoveItem(index)}
                      className="w-full h-[40px]"
                    >
                      Delete
                    </Button>
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
                    const { basePrice } = calculateVat(itemTotal, supplierVatPreference);
                    return sum + basePrice;
                  }, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT Amount:</span>
                  <span>{formatVatAmount(items.reduce((sum, item) => {
                    const itemTotal = item.quantity * item.price;
                    const { vatAmount } = calculateVat(itemTotal, supplierVatPreference);
                    return sum + vatAmount;
                  }, 0))}</span>
                </div>
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
            Create Purchase
          </Button>
        </div>
      </div>
    </form>
  )
}

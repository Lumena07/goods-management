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
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState('')
  const [supplierPrices, setSupplierPrices] = useState<SupplierPrice[]>([])
  const [items, setItems] = useState<PurchaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [supplierVatPreference, setSupplierVatPreference] = useState<VatPreference>(
    supplier?.vatPreference || 'VAT_INCLUSIVE'
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/products')
        ])
        
        if (suppliersRes.ok && productsRes.ok) {
          const [suppliersData, productsData] = await Promise.all([
            suppliersRes.json(),
            productsRes.json()
          ])
          setSuppliers(suppliersData)
          setProducts(productsData)
        }
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
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div>
          <Label htmlFor="supplier">Supplier</Label>
          <Select
            value={selectedSupplier}
            onValueChange={(value) => setSelectedSupplier(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
                    {supplierPrices.map(sp => (
                      <SelectItem key={sp.productId} value={sp.productId}>
                        {sp.product.name} @ TZS {sp.price.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-3">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Label>Price (TZS)</Label>
                <Input
                  type="number"
                  value={item.price}
                  disabled
                  className="w-full bg-gray-50 cursor-not-allowed"
                />
              </div>
              <div className="col-span-1 flex items-end">
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
                    <span>{formatVatAmount(items.reduce((sum, item) => sum + (item.quantity * item.price), 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Amount:</span>
                    <span>{formatVatAmount(items.reduce((sum, item) => {
                      const subtotal = item.quantity * item.price;
                      const { vatAmount } = getVatBreakdown(subtotal, supplierVatPreference);
                      return sum + parseFloat(vatAmount.replace(/[^0-9.-]+/g, ''));
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
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">
            Create Purchase
          </Button>
        </div>
      </div>
    </form>
  )
} 
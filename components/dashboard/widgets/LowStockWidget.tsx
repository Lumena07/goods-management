import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface Product {
  id: string
  name: string
  currentStock: number
  minStock: number
}

export default function LowStockWidget() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      try {
        const response = await fetch('/api/products/low-stock')
        if (!response.ok) {
          throw new Error('Failed to fetch low stock products')
        }
        const data = await response.json()
        setProducts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching low stock products:', error)
        setError('Failed to load low stock products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchLowStockProducts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No products are low in stock.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-[#1e3a8a]">{product.name}</p>
                  <p className="text-sm text-red-500">
                    Current Stock: {product.currentStock} (Min: {product.minStock})
                  </p>
                </div>
                <Link href={`/products/${product.id}`}>
                  <Button variant="ghost" size="sm" className="text-[#1e3a8a] hover:text-[#1e3a8a] hover:bg-blue-50">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

interface PurchaseItem {
  id: string
  productId: string
  quantity: number
  received: number
  price: number
  product: {
    name: string
    currentStock: number
  }
}

interface Purchase {
  id: string
  supplier: {
    name: string
  }
  status: 'PENDING' | 'RECEIVED' | 'CANCELLED'
  items: PurchaseItem[]
}

export default function PurchaseReceive() {
  const router = useRouter()
  const { id } = router.query
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [receivedItems, setReceivedItems] = useState<{ id: string; received: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchPurchase()
    }
  }, [id])

  const fetchPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/${id}`)
      if (response.status === 404) {
        setError('Purchase not found. It may have been deleted or the ID is incorrect.')
        return
      }
      if (!response.ok) throw new Error('Failed to fetch purchase')
      
      const data = await response.json()
      setPurchase(data)
      setReceivedItems(data.items.map((item: PurchaseItem) => ({
        id: item.id,
        received: item.received || 0
      })))
    } catch (error) {
      setError('Error loading purchase details. Please try again later.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all items before submitting
    const hasInvalidQuantities = receivedItems.some(receivedItem => {
      const originalItem = purchase?.items.find(item => item.id === receivedItem.id)
      return originalItem && receivedItem.received > originalItem.quantity
    })

    if (hasInvalidQuantities) {
      setError('Received quantities cannot exceed ordered quantities')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/purchases/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'RECEIVED',
          receivedItems
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update purchase')
      }

      router.push('/purchases')
    } catch (error) {
      setError('Failed to update purchase')
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReceivedChange = (itemId: string, value: number) => {
    // Find the original item to check quantity
    const originalItem = purchase?.items.find(item => item.id === itemId)
    if (!originalItem) return

    // Ensure value is not negative and doesn't exceed ordered quantity
    const validatedValue = Math.max(0, Math.min(value, originalItem.quantity))
    
    setReceivedItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, received: validatedValue }
          : item
      )
    )
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!purchase) return <div>Purchase not found</div>

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Receive Purchase from {purchase.supplier.name}
        </h3>
        
        <div className="mt-5">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {purchase.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">
                        {item.product.name}
                      </label>
                      <div className="mt-1 text-sm text-gray-500">
                        Ordered: {item.quantity} | Current Stock: {item.product.currentStock}
                      </div>
                    </div>
                    <div className="w-32">
                      <label className="sr-only">Received quantity</label>
                      <input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={receivedItems.find(ri => ri.id === item.id)?.received || 0}
                        onChange={(e) => handleReceivedChange(item.id, parseInt(e.target.value) || 0)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      {receivedItems.find(ri => ri.id === item.id)?.received > item.quantity && (
                        <p className="mt-1 text-xs text-red-600">
                          Cannot exceed {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Confirm Reception'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 
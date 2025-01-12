import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Store,
  Package,
  FileText,
  Truck,
} from "lucide-react"

export default function Sidebar() {
  const { data: session } = useSession()

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#1e3a8a]">
      <div className="flex h-16 items-center border-b border-blue-700 px-6">
        <span className="text-lg font-semibold text-white">Navigation</span>
      </div>
      <nav className="mt-5 px-4 space-y-2">
        <Link href="/dashboard" className="block">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
          >
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </Button>
        </Link>
        
        <Link href="/sales" className="block">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
          >
            <ShoppingCart className="mr-3 h-5 w-5" />
            Sales
          </Button>
        </Link>
        
        <Link href="/customers" className="block">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
          >
            <Users className="mr-3 h-5 w-5" />
            Customers
          </Button>
        </Link>
        
        <Link href="/purchases" className="block">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
          >
            <Store className="mr-3 h-5 w-5" />
            Purchases
          </Button>
        </Link>

        {session?.user.role === 'ADMIN' && (
          <>
            <Link href="/products" className="block">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
              >
                <Package className="mr-3 h-5 w-5" />
                Products
              </Button>
            </Link>
            
            <Link href="/reports" className="block">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
              >
                <FileText className="mr-3 h-5 w-5" />
                Reports
              </Button>
            </Link>
            
            <Link href="/suppliers" className="block">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-blue-700"
              >
                <Truck className="mr-3 h-5 w-5" />
                Suppliers
              </Button>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
} 
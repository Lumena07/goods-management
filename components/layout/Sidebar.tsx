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
  ChevronLeft,
  ChevronRight,
  Menu,
  BarChart2,
  Receipt,
} from "lucide-react"
import { cn } from '@/lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: (collapsed: boolean) => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession()

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 bg-[#1e3a8a] transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-blue-700 px-3 justify-between relative">
        <span className={cn(
          "text-lg font-semibold text-white transition-opacity duration-200 ml-3",
          isCollapsed ? "opacity-0 hidden" : "opacity-100 hidden md:block"
        )}>
          Navigation
        </span>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-0 text-white hover:bg-blue-700 rounded-l-none h-16 px-3",
            isCollapsed ? "w-full justify-center" : "hover:bg-blue-700/50"
          )}
          onClick={() => onToggle(!isCollapsed)}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>
      <nav className="mt-5 px-4 space-y-2">
        <Link href="/dashboard" className="block">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-white hover:text-white hover:bg-blue-700",
              isCollapsed && "justify-center px-0"
            )}
          >
            <LayoutDashboard className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            <span className={cn(
              "transition-opacity duration-200",
              isCollapsed ? "hidden" : "block"
            )}>
              Dashboard
            </span>
          </Button>
        </Link>
        
        <Link href="/sales" className="block">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-white hover:text-white hover:bg-blue-700",
              isCollapsed && "justify-center px-0"
            )}
          >
            <ShoppingCart className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            <span className={cn(
              "transition-opacity duration-200",
              isCollapsed ? "hidden" : "block"
            )}>
              Sales
            </span>
          </Button>
        </Link>
        
   
        <Link href="/purchases" className="block">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-white hover:text-white hover:bg-blue-700",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Store className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            <span className={cn(
              "transition-opacity duration-200",
              isCollapsed ? "hidden" : "block"
            )}>
              Purchases
            </span>
          </Button>
        </Link>

        <Link href="/expenses" className="block">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-white hover:text-white hover:bg-blue-700",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Receipt className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            <span className={cn(
              "transition-opacity duration-200",
              isCollapsed ? "hidden" : "block"
            )}>
              Expenses
            </span>
          </Button>
        </Link>

        {session?.user.role === 'ADMIN' && (
          <>
               <Link href="/customers" className="block">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-white hover:text-white hover:bg-blue-700",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Users className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
            <span className={cn(
              "transition-opacity duration-200",
              isCollapsed ? "hidden" : "block"
            )}>
              Customers
            </span>
          </Button>
        </Link>
        
            
            
            <Link href="/products" className="block">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Package className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn(
                  "transition-opacity duration-200",
                  isCollapsed ? "hidden" : "block"
                )}>
                  Products
                </span>
              </Button>
            </Link>
            
            <Link href="/reports" className="block">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <FileText className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn(
                  "transition-opacity duration-200",
                  isCollapsed ? "hidden" : "block"
                )}>
                  Reports
                </span>
              </Button>
            </Link>
            
            <Link href="/suppliers" className="block">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Truck className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn(
                  "transition-opacity duration-200",
                  isCollapsed ? "hidden" : "block"
                )}>
                  Suppliers
                </span>
              </Button>
            </Link>
            <Link href="/analytics" className="block">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <BarChart2 className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn(
                  "transition-opacity duration-200",
                  isCollapsed ? "hidden" : "block"
                )}>
                  Analytics
                </span>
              </Button>
            </Link>
            <Link href="/admin/users" className="block">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white hover:text-white hover:bg-blue-700",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Users className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-3")} />
                <span className={cn(
                  "transition-opacity duration-200",
                  isCollapsed ? "hidden" : "block"
                )}>
                  User Management
                </span>
              </Button>
            </Link>
          </>
        )}
      </nav>
    </div>
  )
} 

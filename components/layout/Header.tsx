import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { CubeIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface HeaderProps {
  onMobileMenuClick: () => void
}

export default function Header({ onMobileMenuClick }: HeaderProps) {
  const { data: session } = useSession()

  return (
    <header className="bg-[#1e3a8a] border-b border-[#2563eb]/20 w-full">
      <div className="h-16 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="md:hidden rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
            onClick={onMobileMenuClick}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <CubeIcon className="h-6 w-6 text-white" />
            <span className="text-lg font-bold text-white">MALI(POS)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-blue-200">
            <User className="h-4 w-4" />
            <span className="text-sm">Hello, {session?.user.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => signOut()}
            className="text-white hover:bg-white/10"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}

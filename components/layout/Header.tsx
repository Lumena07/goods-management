import { useSession, signOut } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import {  CubeIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-[#1e3a8a] border-b border-[#2563eb]/20">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <div className="flex-shrink-0 flex items-center space-x-2">
                <CubeIcon className="h-8 w-8 text-white" />
                <h1 className="text-xl font-bold text-white">MALI(POS)</h1>
              </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-blue-200">
            <User className="h-4 w-4" />
            <span>Hello, {session?.user.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => signOut()}
            className="text-white hover:bg-white"
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  )
}
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface NavbarProps {
  userProfile?: {
    name?: string;
    [key: string]: any;
  };
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  heading: string;
  placeholder:string
}

export function Navbar({ userProfile, onSearch, searchTerm, heading ,placeholder}: NavbarProps) {
  return (
    <div className="bg-white px-8 py-6 border-b border-[#e1e1e1]">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-[#000000]">
          {heading}
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7b7b7b] w-4 h-4" />
            <Input
              placeholder={placeholder}
              
              value={searchTerm}
              onChange={onSearch}
              className="pl-10 w-80 bg-[#f1f2f3] border-[#e1e1e1] text-[#000000]"
            />
          </div>
          <Avatar className="w-10 h-10">
            <AvatarImage src={userProfile?.avatar || "/placeholder-user.jpg"} />
            <AvatarFallback className="bg-[#7b7b7b] text-white">
              {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'JD'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  )
}

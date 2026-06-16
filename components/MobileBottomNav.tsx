'use client'

import { Home, BookOpen, User, Settings, ShoppingBag, Book, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: Home,
  },
  {
    label: 'Quiz',
    href: '/quiz',
    icon: BadgeQuestionMark,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80',
        'md:hidden', // 👈 hide on desktop
      )}
    >
      <div className="grid grid-cols-5">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-2 text-xs transition-colors relative',
                isActive
                  ? 'text-primary before:absolute before:z-[-1] before:rounded-md before:bg-primary/10 before:p-1 before:max-w-[80px] before:w-[80%] before:h-[90%] before:animate-pulse'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      {/* <div className="h-7 bottom-spaces"></div> */}
    </nav>
  )
}

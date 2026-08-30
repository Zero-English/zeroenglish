'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Home, Search, User, BadgeQuestionMark, LibraryBig, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStatus } from '@/lib/auth-store'

const itemClass =
  'flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { status } = useAuthStatus()
  const isLoggedIn = status === 'guest' || status === 'authenticated'
  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/vocabulary', label: 'Vocabulary', icon: LibraryBig },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/quiz', label: 'Quiz', icon: BadgeQuestionMark },
    isLoggedIn
      ? { href: '/profile', label: 'Profile', icon: User }
      : { href: '/login', label: 'Login', icon: LogIn },
  ]
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY.current && currentScrollY > 300) {
        setIsHidden(true)
      } else {
        setIsHidden(false)
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      animate={{ y: isHidden ? '100%' : '0%' }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
    >
      <div className="flex items-center justify-between p-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                itemClass,
                active
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium leading-none">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Home, Search, User, BadgeQuestionMark, LibraryBig, LogIn } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { useAuthStatus } from '@/lib/auth-store'
import { useT } from '@/components/language-provider'
import { UserAvatar } from '@/components/UserAvatar'

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.9 } as const

const itemClass =
  'relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors'

export function MobileBottomNav() {
  const pathname = usePathname()
  const { status } = useAuthStatus()
  const { data: session } = useSession()
  const isLoggedIn = status !== 'none'
  const isGoogle = status === 'google'
  const t = useT()
  const links = [
    { href: '/', label: t('হোম', 'Home'), icon: Home },
    { href: '/vocabulary', label: t('শব্দভাণ্ডার', 'Vocabulary'), icon: LibraryBig },
    { href: '/search', label: t('অনুসন্ধান', 'Search'), icon: Search },
    { href: '/quiz', label: t('কুইজ', 'Quiz'), icon: BadgeQuestionMark },
    isLoggedIn
      ? { href: '/profile', label: t('প্রোফাইল', 'Profile'), icon: User, avatar: isGoogle ? session?.user : null }
      : { href: '/login', label: t('লগইন', 'Login'), icon: LogIn },
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
      transition={spring}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
    >
      <div className="relative flex items-center justify-between p-1">
        {links.map(({ href, label, icon: Icon, avatar }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          const showAvatar = !!avatar?.image
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                itemClass,
                active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {active && (
                <motion.span
                  layoutId="bottom-nav-active"
                  transition={spring}
                  className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/15"
                />
              )}
              <span className="relative z-10 flex flex-col items-center gap-0.5">
                {showAvatar ? (
                  <UserAvatar
                    id={avatar.id ?? 0}
                    name={avatar.name}
                    userName={avatar.name}
                    image={avatar.image}
                    size="sm"
                  />
                ) : (
                  <motion.span
                    animate={active ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                    transition={spring}
                    className="block [&>svg]:transition-colors"
                  >
                    <Icon
                      className={cn('size-5', active && 'text-primary')}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.span>
                )}
                {!showAvatar && (
                  <motion.span
                    animate={
                      active
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 0.75, y: 0, scale: 1 }
                    }
                    transition={{ duration: 0.18 }}
                    className={cn(
                      'text-[10px] leading-none transition-colors',
                      active ? 'font-bold text-primary' : 'font-medium',
                    )}
                  >
                    {label}
                  </motion.span>
                )}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
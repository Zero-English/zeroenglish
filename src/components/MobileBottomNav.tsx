'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion } from 'motion/react'
import {
  Home,
  User,
  BadgeQuestionMark,
  LibraryBig,
  Trophy,
  Search,
  Sun,
  Moon,
  Languages,
  LogOut,
  LogIn,
  Shield,
  SquarePen,
  Newspaper,
  Info,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'
import { useAuthStatus, useAuthStore } from '@/lib/auth-store'
import { useSelectedLevel } from '@/lib/level-store'
import { useLanguage } from '@/components/language-provider'
import { useQuizChrome } from '@/lib/quiz-chrome'
import { UserAvatar } from '@/components/UserAvatar'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

const spring = { type: 'spring', stiffness: 420, damping: 32, mass: 0.9 } as const

const itemClass =
  'relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 transition-colors cursor-pointer'

export function MobileBottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const hidden = useQuizChrome((s) => s.hidden)
  const { status } = useAuthStatus()
  const logout = useAuthStore((s) => s.logout)
  const { data: session } = useSession()
  const { lang, toggleLanguage, t } = useLanguage()
  const { theme, setTheme, systemTheme } = useTheme()
  const { level } = useSelectedLevel()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const lastScrollY = useRef(0)

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isLoggedIn = status !== 'none'
  const user = session?.user
  const canContribute = user?.role === 'admin' || user?.role === 'contributor'

  const vocabularyHref = level ? `/vocabulary/${level.toLowerCase()}` : '/vocabulary'

  const navLinks = [
    { href: '/', label: t('হোম', 'Home'), icon: Home },
    { href: vocabularyHref, label: t('শব্দভাণ্ডার', 'Vocabulary'), icon: LibraryBig },
    { href: '/quiz', label: t('কুইজ', 'Quiz'), icon: BadgeQuestionMark },
    { href: '/leaderboard', label: t('লিডারবোর্ড', 'Leaderboard'), icon: Trophy },
  ]

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  const handleSignOut = async () => {
    setDrawerOpen(false)
    logout()
    await Promise.allSettled([
      fetch('/api/v1/auth/logout', { method: 'POST' }),
      signOut({ redirect: false }),
    ])
    router.push('/')
    router.refresh()
  }

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

  if (hidden) return null

  const isProfileActive = pathname === '/profile' || pathname === '/login' || drawerOpen

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <motion.nav
        animate={{ y: isHidden ? '100%' : '0%' }}
        transition={spring}
        className="fixed bottom-nav inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 md:hidden"
      >
        <div className="relative flex items-center justify-between p-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  itemClass,
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    transition={spring}
                    className="absolute inset-0 rounded-lg bg-primary/15"
                  />
                )}
                <span className="relative z-10 flex flex-col items-center gap-0.5">
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
                  <motion.span
                    animate={
                      active
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 0.75, y: 0, scale: 1 }
                    }
                    transition={{ duration: 0.18 }}
                    className={cn(
                      'text-[10px] leading-none transition-colors',
                      active ? 'font-bold text-primary' : 'font-medium'
                    )}
                  >
                    {label}
                  </motion.span>
                </span>
              </Link>
            )
          })}

          {/* Profile & Options Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open profile options menu"
            className={cn(
              itemClass,
              isProfileActive ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {isProfileActive && (
              <motion.span
                layoutId="bottom-nav-active"
                transition={spring}
                className="absolute inset-0 rounded-lg bg-primary/15"
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-0.5">
              {isLoggedIn && user ? (
                <UserAvatar
                  id={(user as { id?: number }).id ?? 1}
                  name={user.name}
                  userName={user.name}
                  image={user.image}
                  size="sm"
                  className="size-6 text-[11px]"
                />
              ) : (
                <>
                  <motion.span
                    animate={isProfileActive ? { y: -2, scale: 1.15 } : { y: 0, scale: 1 }}
                    transition={spring}
                    className="block [&>svg]:transition-colors"
                  >
                    <User
                      className={cn('size-5', isProfileActive && 'text-primary')}
                      strokeWidth={isProfileActive ? 2.5 : 2}
                    />
                  </motion.span>
                  <motion.span
                    animate={
                      isProfileActive
                        ? { opacity: 1, y: 0, scale: 1 }
                        : { opacity: 0.75, y: 0, scale: 1 }
                    }
                    transition={{ duration: 0.18 }}
                    className={cn(
                      'text-[10px] leading-none transition-colors',
                      isProfileActive ? 'font-bold text-primary' : 'font-medium'
                    )}
                  >
                    {t('মেনু', 'Menu')}
                  </motion.span>
                </>
              )}
            </span>
          </button>
        </div>
      </motion.nav>

      {/* shadcn UI Default Profile & Options Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh] bg-popover text-popover-foreground border-border rounded-t-2xl">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{t('প্রোফাইল ও মেনু', 'Profile & Menu')}</DrawerTitle>
            <DrawerDescription>
              {t('প্রোফাইল, সেটিংস এবং প্রয়োজনীয় অপশনস', 'Profile, settings and important options')}
            </DrawerDescription>
          </DrawerHeader>

          {/* User Status / Profile Card */}
          <div className="px-5 pt-3 pb-2">
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-muted/50 border border-border/80">
              <div className="flex items-center gap-3 min-w-0">
                {isLoggedIn && user ? (
                  <UserAvatar
                    id={(user as { id?: number }).id ?? 1}
                    name={user.name}
                    userName={user.name}
                    image={user.image}
                    size="md"
                  />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {isLoggedIn && user ? user.name || 'Learner' : t('স্বাগতম', 'Welcome')}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {isLoggedIn && user
                      ? user.email || t('সক্রিয় শিক্ষার্থী', 'Active Learner')
                      : t('লগইন করুন সম্পূর্ণ সুবিধা পেতে', 'Sign in to sync your progress')}
                  </p>
                </div>
              </div>

              {isLoggedIn ? (
                <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                  <Link href="/profile" onClick={() => setDrawerOpen(false)}>
                    {t('প্রোফাইল', 'Profile')}
                  </Link>
                </Button>
              ) : (
                <Button size="sm" asChild className="h-7 text-xs gap-1">
                  <Link href="/login" onClick={() => setDrawerOpen(false)}>
                    <LogIn className="size-3.5" />
                    <span>{t('লগইন', 'Login')}</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Settings Bar (Language & Theme) */}
          <div className="px-5 py-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="justify-between h-9 px-3 text-xs"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Languages className="size-3.5" />
                  <span>{t('ভাষা', 'Language')}</span>
                </span>
                <span className="font-semibold text-foreground">
                  {lang === 'bn' ? 'বাংলা' : 'English'}
                </span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="justify-between h-9 px-3 text-xs"
              >
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {mounted && currentTheme === 'dark' ? (
                    <Sun className="size-3.5" />
                  ) : (
                    <Moon className="size-3.5" />
                  )}
                  <span>{t('থিম', 'Theme')}</span>
                </span>
                <span className="font-semibold capitalize text-foreground">
                  {mounted ? currentTheme : 'system'}
                </span>
              </Button>
            </div>
          </div>

          {/* Main Option Navigation Links */}
          <div className="px-5 py-2 space-y-1 overflow-y-auto">
            <p className="px-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              {t('প্রয়োজনীয় অপশন', 'Important Options')}
            </p>

            <Link
              href="/search"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
                  <Search className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('শব্দ অনুসন্ধান', 'Search Words')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('তাৎক্ষণিক অর্থ খুঁজুন', 'Find bilingual definitions')}</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </Link>

            <Link
              href="/profile"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('আমার শব্দতালিকা ও অগ্রগতি', 'My Words & Progress')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('বুকমার্ক ও শেখা শব্দাবলী', 'Bookmarks & learned lists')}</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </Link>

            <Link
              href="/news"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Newspaper className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('নিউজ ও ব্লগ', 'News & Articles')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('ইংরেজি শেখার টিপস ও গাইড', 'Learning guides & updates')}</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </Link>

            {canContribute && (
              <Link
                href="/contribute"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <SquarePen className="size-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{t('কন্ট্রিবিউট করুন', 'Contribute Words')}</p>
                    <p className="text-[10px] text-muted-foreground">{t('নতুন শব্দ জমা দিন', 'Submit vocabulary additions')}</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground/60" />
              </Link>
            )}

            {/* Admin Panel Button */}
            <Link
              href="/admin"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Shield className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('অ্যাডমিন প্যানেল', 'Admin Panel')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('সিস্টেম ও কনটেন্ট ম্যানেজমেন্ট', 'System & content management')}</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </Link>

            {/* Facebook Page Button */}
            <a
              href="https://facebook.com/zeroenglishorg"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
                  <FacebookIcon className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('ফেসবুক পেইজ', 'Facebook Page')}</p>
                  <p className="text-[10px] text-muted-foreground">facebook.com/zeroenglishorg</p>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-muted-foreground/60" />
            </a>

            <Link
              href="/about"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Info className="size-4" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{t('আমাদের সম্পর্কে', 'About Platform')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('জিরো ইংলিশ এর লক্ষ্য ও তথ্য', 'Platform info & contacts')}</p>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/60" />
            </Link>
          </div>

          <Separator className="my-2" />

          {/* Drawer Footer Actions */}
          <div className="px-5 pb-6 pt-1">
            {isLoggedIn ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-center gap-2 h-9 text-xs"
              >
                <LogOut className="size-3.5" />
                <span>{t('লগ আউট করুন', 'Sign out')}</span>
              </Button>
            ) : (
              <Button
                size="sm"
                asChild
                className="w-full justify-center gap-2 h-9 text-xs"
              >
                <Link href="/login" onClick={() => setDrawerOpen(false)}>
                  <LogIn className="size-3.5" />
                  <span>{t('লগইন / রেজিস্টার করুন', 'Sign in / Register')}</span>
                </Link>
              </Button>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
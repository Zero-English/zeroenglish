'use client'

import { motion } from 'motion/react'
import {
  Menu,
  Sun,
  Moon,
  Languages,
  User,
  X,
  Sparkles,
  LogOut,
  Shield,
  SquarePen,
  Trophy,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

import { DesktopNav, type NavItem, type LocalizedText } from '@/components/Header/DesktopNav'
import { MobileNav, type MobileNavItem } from '@/components/Header/MobileNav'
import { useLanguage } from '@/components/language-provider'
import { useAuthStatus, useAuthStore } from '@/lib/auth-store'
import { useQuizChrome } from '@/lib/quiz-chrome'
import { UserAvatar } from '@/components/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import logo from '@/public/assets/logo/main-logo.webp'

const BANNER = {
  text: {
    en: 'Master 5,000+ English words from A1 to C1 with daily quizzes!',
    bn: 'A1 থেকে C1 পর্যন্ত ৫,০০০+ ইংরেজি শব্দ ও কুইজ দিয়ে প্রস্তুতি নিন!',
  } satisfies LocalizedText,
  href: '/vocabulary',
  links: [
    { label: { en: 'Vocabulary', bn: 'শব্দভাণ্ডার' }, href: '/vocabulary' },
    { label: { en: 'Quiz', bn: 'কুইজ' }, href: '/quiz' },
    { label: { en: 'Leaderboard', bn: 'লিডারবোর্ড' }, href: '/leaderboard' },
  ],
}

const NAV_ITEMS: NavItem[] = [
  {
    label: { en: 'Vocabulary', bn: 'শব্দভাণ্ডার' },
    href: '/vocabulary',
    columns: [
      {
        title: { en: 'CEFR Proficiency Levels', bn: 'দক্ষতার স্তর' },
        links: [
          {
            label: { en: 'A1 - Beginner', bn: 'A1 - প্রারম্ভিক' },
            href: '/vocabulary/a1',
            description: {
              en: 'Essential everyday vocabulary and phrases',
              bn: 'দৈনন্দিন জীবনের প্রাথমিক ও প্রয়োজনীয় শব্দাবলী',
            },
          },
          {
            label: { en: 'A2 - Elementary', bn: 'A2 - প্রাথমিক' },
            href: '/vocabulary/a2',
            description: {
              en: 'Basic expressions and simple contexts',
              bn: 'সহজ বাক্য গঠন ও মৌলিক কথোপকথন',
            },
          },
          {
            label: { en: 'B1 - Intermediate', bn: 'B1 - মাধ্যমিক' },
            href: '/vocabulary/b1',
            description: {
              en: 'Work, study and personal interests',
              bn: 'কর্মক্ষেত্র ও পড়াশোনার প্রয়োজনীয় শব্দ',
            },
          },
          {
            label: { en: 'B2 - Upper Intermediate', bn: 'B2 - উচ্চ-মাধ্যমিক' },
            href: '/vocabulary/b2',
            description: {
              en: 'Complex discussions and technical nuance',
              bn: 'উন্নত আলোচনা ও জটিল বিষয়ের শব্দভাণ্ডার',
            },
          },
          {
            label: { en: 'C1 - Advanced', bn: 'C1 - উচ্চাঙ্গ/উন্নত' },
            href: '/vocabulary/c1',
            description: {
              en: 'Fluent academic and professional vocabulary',
              bn: 'উচ্চাঙ্গের প্রাতিষ্ঠানিক ও পেশাদার শব্দ',
            },
          },
        ],
      },
      {
        title: { en: 'Practice & Tools', bn: 'টুলস ও অনুশীলন' },
        links: [
          {
            label: { en: 'All Words Dictionary', bn: 'সকল শব্দতালিকা' },
            href: '/vocabulary',
            description: {
              en: 'Browse 5,000+ words with Bangla meanings & examples',
              bn: 'বাংলা অর্থ ও উদাহরণসহ ৫,০০০+ শব্দ দেখুন',
            },
          },
          {
            label: { en: 'Word Search', bn: 'শব্দ অনুসন্ধান' },
            href: '/search',
            description: {
              en: 'Instant bilingual dictionary keyword search',
              bn: 'যেকোনো ইংরেজি বা বাংলা শব্দ তাৎক্ষণিক খুঁজুন',
            },
          },
          {
            label: { en: 'Leaderboard', bn: 'সেরা শিক্ষার্থী র্যাঙ্কিং' },
            href: '/leaderboard',
            description: {
              en: 'Top performers and weekly quiz rankings',
              bn: 'সেরা লার্নারদের তালিকা ও পয়েন্ট অবস্থান',
            },
          },
        ],
      },
    ],
  },
  {
    label: { en: 'Quiz', bn: 'কুইজ' },
    href: '/quiz',
    columns: [
      {
        title: { en: 'Interactive Practice', bn: 'ইন্টারেক্টিভ কুইজ' },
        links: [
          {
            label: { en: 'Vocabulary Quiz', bn: 'শব্দভাণ্ডার কুইজ' },
            href: '/quiz',
            description: {
              en: 'Test yourself with four-option word questions',
              bn: 'চারটি অপশন থেকে সঠিক অর্থ বেছে নিন',
            },
          },
          {
            label: { en: 'Leaderboard Score', bn: 'লিডারবোর্ড ও স্কোর' },
            href: '/leaderboard',
            description: {
              en: 'Earn XP, track streak and climb the ranks',
              bn: 'পয়েন্ট অর্জন করুন এবং বন্ধুদের সাথে প্রতিযোগিতা করুন',
            },
          },
        ],
      },
    ],
  },
  {
    label: { en: 'News & Blog', bn: 'নিউজ ও ব্লগ' },
    href: '/news',
    columns: [
      {
        title: { en: 'Guides & Articles', bn: 'গাইড ও নিবন্ধ' },
        links: [
          {
            label: { en: 'All Articles', bn: 'সকল নিবন্ধ' },
            href: '/news',
            description: {
              en: 'English learning tips, strategies and updates',
              bn: 'সহজে ইংরেজি শেখার কার্যকর পরামর্শ ও আপডেট',
            },
          },
        ],
      },
    ],
  },
  {
    label: { en: 'About', bn: 'আমাদের পরিচিতি' },
    href: '/about',
    columns: [
      {
        title: { en: 'Platform & Info', bn: 'তথ্য ও সহায়তা' },
        links: [
          {
            label: { en: 'About Zero English', bn: 'আমাদের সম্পর্কে' },
            href: '/about',
            description: {
              en: 'Our mission and learning philosophy',
              bn: 'জিরো ইংলিশ প্ল্যাটফর্মের উদ্দেশ্য ও লক্ষ্য',
            },
          },
          {
            label: { en: 'Privacy Policy', bn: 'গোপনীয়তা নীতি' },
            href: '/privacy',
            description: {
              en: 'Data protection and usage terms',
              bn: 'আমাদের তথ্য সুরক্ষা ও শর্তাবলী',
            },
          },
          {
            label: { en: 'Contact Us', bn: 'যোগাযোগ' },
            href: '/contact',
            description: {
              en: 'Send us feedback, questions or suggestions',
              bn: 'যেকোনো মতামত বা সহায়তার জন্য আমাদের লিখুন',
            },
          },
        ],
      },
    ],
  },
]

const MOBILE_ITEMS: MobileNavItem[] = NAV_ITEMS.map(
  ({ label, href, columns }) => ({
    label,
    href,
    children: columns.flatMap((col) =>
      col.links.map((link) => ({ label: link.label, href: link.href }))
    ),
  })
)

const BANNER_STORAGE_KEY = 'zeroenglish:banner-dismissed'
const BANNER_EVENT = 'zeroenglish:banner-dismissed-change'
const SCROLL_HIDE_THRESHOLD = 96

function subscribeBanner(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange)
  window.addEventListener(BANNER_EVENT, onStoreChange)
  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(BANNER_EVENT, onStoreChange)
  }
}

function getBannerDismissed() {
  try {
    return localStorage.getItem(BANNER_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function Header() {
  const hidden = useQuizChrome((s) => s.hidden)
  const { data: session } = useSession()
  const { status } = useAuthStatus()
  const logout = useAuthStore((s) => s.logout)
  const { lang, toggleLanguage } = useLanguage()
  const { theme, setTheme, systemTheme } = useTheme()
  const router = useRouter()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const bannerDismissed = useSyncExternalStore(
    subscribeBanner,
    getBannerDismissed,
    () => false
  )

  const currentTheme = theme === 'system' ? systemTheme : theme
  const isLoggedIn = status !== 'none'
  const user = session?.user
  const isAdmin = user?.role === 'admin'
  const canContribute = user?.role === 'admin' || user?.role === 'contributor'

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  useEffect(() => {
    let lastScrollY = window.scrollY
    const onScroll = () => {
      const currentScrollY = window.scrollY
      setIsScrolled(currentScrollY > 10)
      if (currentScrollY < 300) {
        setIsHidden(false)
      } else {
        if (currentScrollY > lastScrollY && currentScrollY > SCROLL_HIDE_THRESHOLD) {
          setIsHidden(true)
        } else if (currentScrollY < lastScrollY) {
          setIsHidden(false)
        }
      }
      lastScrollY = currentScrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (hidden) return null

  const banner = bannerDismissed ? null : BANNER

  const handleSignOut = async () => {
    logout()
    await Promise.allSettled([
      fetch('/api/v1/auth/logout', { method: 'POST' }),
      signOut({ redirect: false }),
    ])
    router.push('/')
    router.refresh()
  }

  return (
    <>
      {banner && (
        <div className="relative z-40 w-full overflow-hidden border-b border-border/60 bg-background text-[11px] sm:text-xs text-muted-foreground">
          <div className="mx-auto flex h-7 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
            <Link
              href={banner.href}
              className="flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary truncate"
            >
              <Sparkles className="size-3 text-primary shrink-0" />
              <span className="truncate">{lang === 'en' ? banner.text.en : banner.text.bn}</span>
            </Link>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-3">
                {banner.links.map((link) => (
                  <Link
                    key={`${link.label.en}-${link.href}`}
                    href={link.href}
                    className="transition-colors hover:text-foreground"
                  >
                    {lang === 'en' ? link.label.en : link.label.bn}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.header
        initial={false}
        animate={{ y: isHidden ? '-100%' : '0%' }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className={`sticky top-0 z-40 w-full transform-gpu border-b bg-background transition-colors ${
          isScrolled ? 'border-border' : 'border-border/60'
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Logo & Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <Image
              src={logo}
              alt="Zero English"
              className="h-5 w-auto dark:brightness-0 dark:invert"
            />
          </Link>

          {/* Desktop Nav Mega Menus */}
          <DesktopNav items={NAV_ITEMS} hidden={isHidden} />

          {/* Right Action Icons */}
          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              aria-label={lang === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
              title={lang === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
              className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Languages className="size-4" />
              <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
            </Button>

            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleTheme}
              aria-label={
                mounted && currentTheme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {mounted &&
                (currentTheme === 'dark' ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                ))}
            </Button>

            {/* User Session & Profile Menu */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="relative size-8 overflow-hidden rounded-full p-0 hidden md:inline-flex"
                    aria-label="User profile menu"
                  >
                    <UserAvatar
                      id={(user as { id?: number }).id ?? 1}
                      name={user.name}
                      userName={user.name}
                      image={user.image}
                      size="sm"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-52">
                  <div className="px-2 py-1.5 text-xs">
                    <p className="font-semibold text-foreground truncate">{user.name || 'Learner'}</p>
                    {user.email && (
                      <p className="text-muted-foreground truncate text-[11px]">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer gap-2">
                      <User className="size-3.5 text-muted-foreground" />
                      <span>{lang === 'en' ? 'My Profile & Words' : 'প্রোফাইল ও শব্দতালিকা'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/leaderboard" className="cursor-pointer gap-2">
                      <Trophy className="size-3.5 text-muted-foreground" />
                      <span>{lang === 'en' ? 'Leaderboard' : 'লিডারবোর্ড'}</span>
                    </Link>
                  </DropdownMenuItem>
                  {canContribute && (
                    <DropdownMenuItem asChild>
                      <Link href="/contribute" className="cursor-pointer gap-2">
                        <SquarePen className="size-3.5 text-muted-foreground" />
                        <span>{lang === 'en' ? 'Contribute' : 'কন্ট্রিবিউট'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer gap-2">
                        <Shield className="size-3.5 text-muted-foreground" />
                        <span>{lang === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    variant="destructive"
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="size-3.5" />
                    <span>{lang === 'en' ? 'Sign out' : 'লগ আউট'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:inline-flex h-8 text-xs font-medium"
              >
                <Link href="/login" className="flex items-center gap-1.5">
                  <User className="size-4 text-muted-foreground" />
                  <span>{lang === 'en' ? 'Login' : 'লগইন'}</span>
                </Link>
              </Button>
            )}

            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Open mobile menu"
                  className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground border-r border-sidebar-border"
                showCloseButton={false}
              >
                <div className="relative flex flex-row items-center justify-between border-b border-sidebar-border px-4 py-3.5 h-14">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center space-x-2"
                  >
                    <Image
                      src={logo}
                      alt="Zero English"
                      className="h-5 w-auto dark:brightness-0 dark:invert"
                    />
                  </Link>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    >
                      <X className="size-4" />
                    </Button>
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                  <SheetTitle className="sr-only">
                    {lang === 'en' ? 'Navigation Menu' : 'নেভিগেশন মেনু'}
                  </SheetTitle>
                  <MobileNav
                    items={MOBILE_ITEMS}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>

                <div className="border-t border-sidebar-border p-3 space-y-2">
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignOut()
                      }}
                      className="flex items-center w-full px-3 py-2 rounded-md text-xs font-medium text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 transition-colors gap-2.5"
                    >
                      <LogOut className="size-4 shrink-0" />
                      <span>{lang === 'en' ? 'Log out' : 'লগ আউট'}</span>
                    </button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="w-full justify-center text-xs"
                    >
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        {lang === 'en' ? 'Login' : 'লগইন'}
                      </Link>
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>
    </>
  )
}

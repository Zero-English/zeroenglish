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
  GraduationCap,
  LayoutDashboard,
  ArrowLeft,
  NotebookPen,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'

import { DesktopNav, type NavItem, type LocalizedText } from '@/components/Header/DesktopNav'
import { MobileNav, type MobileNavItem } from '@/components/Header/MobileNav'
import { LoggedInHeader } from '@/components/Header/LoggedInHeader'
export { LoggedInHeader }
import { useLanguage } from '@/components/language-provider'
import { useAuthStatus, useAuthStore } from '@/lib/auth-store'
import { openNotesDialog } from '@/lib/notes-dialog'
import { getHeaderPage } from '@/lib/header-page'
import { useQuizChrome } from '@/lib/quiz-chrome'
import { UserAvatar } from '@/components/UserAvatar'
import { cn } from '@/lib/utils'
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
    { label: { en: 'Grammar', bn: 'গ্রামার' }, href: '/grammar' },
    { label: { en: 'Writing', bn: 'লিখিত' }, href: '/written' },
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
    label: { en: 'Grammar', bn: 'গ্রামার' },
    href: '/grammar',
    columns: [
      {
        title: { en: 'Popular Topics', bn: 'জনপ্রিয় বিষয়সমূহ' },
        links: [
          {
            label: { en: 'Parts of Speech', bn: 'পদ প্রকরণ (Parts of Speech)' },
            href: '/grammar/parts-of-speech',
            description: {
              en: 'Nouns, Pronouns, Verbs, Adjectives & more',
              bn: 'নাউন, প্রোনাউন, ভার্ব ও অন্যান্য পদের নিয়ম',
            },
          },
          {
            label: { en: 'Tense & Time', bn: 'টেন্স ও সময় (Tense)' },
            href: '/grammar/tense',
            description: {
              en: 'Master present, past, and future tense rules',
              bn: '১২টি টেন্সের গঠন, ব্যবহার ও বাস্তব উদাহরণ',
            },
          },
          {
            label: { en: 'Sentence Structure', bn: 'বাক্য গঠন (Sentence)' },
            href: '/grammar/sentence-structure',
            description: {
              en: 'Simple, Compound, Complex & conditionals',
              bn: 'বাক্যের প্রকারভেদ ও রূপান্তরের নিয়মাবলী',
            },
          },
        ],
      },
      {
        title: { en: 'Learn & Track', bn: 'শেখা ও অগ্রগতি' },
        links: [
          {
            label: { en: 'All Grammar Topics', bn: 'সকল ব্যাকরণ বিষয়' },
            href: '/grammar',
            description: {
              en: 'Browse comprehensive curated English grammar lessons',
              bn: 'সকল প্রয়োজনীয় ইংরেজি ব্যাকরণ টপিক ও গাইড দেখুন',
            },
          },
          {
            label: { en: 'My Grammar Rules', bn: 'আমার ব্যাকরণ রুলস' },
            href: '/profile?tab=learned&type=grammar',
            description: {
              en: 'Quick access to your learned and bookmarked rules',
              bn: 'আপনার শেখা ও বুকমার্ক করা রুলস সরাসরি দেখুন',
            },
          },
          {
            label: { en: 'Grammar Quiz', bn: 'গ্রামার কুইজ' },
            href: '/quiz',
            description: {
              en: 'Test your understanding with rule-based questions',
              bn: 'গ্রামার রুল ভিত্তিক কুইজ দিয়ে প্রস্তুতি যাচাই করুন',
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
            label: { en: 'Daily Practice', bn: 'দৈনিক অনুশীলন' },
            href: '/quiz/daily',
            description: {
              en: '10 questions in 20s each, once daily to grow your streak',
              bn: 'প্রতিদিন ১ বার ১০টি প্রশ্ন দিয়ে স্ট্রিক রক্ষা করুন',
            },
          },
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
    label: { en: 'Writing', bn: 'লিখিত' },
    href: '/written',
    columns: [
      {
        title: { en: 'Written Practice', bn: 'লিখিত প্রস্তুতি' },
        links: [
          {
            label: { en: 'All Written Content', bn: 'সকল লিখিত বিষয়' },
            href: '/written',
            description: {
              en: 'Browse paragraphs, essays, letters, and dialogues',
              bn: 'প্যারাগ্রাফ, রচনা, চিঠি ও ডায়ালগের সমাহার',
            },
          },
          {
            label: { en: 'Paragraph Writing', bn: 'প্যারাগ্রাফ (Paragraph)' },
            href: '/written?type=Paragraph',
            description: {
              en: 'Model paragraphs with easy, medium, and hard tiers',
              bn: 'বাংলা অর্থসহ সহজ ও উন্নত মডেল প্যারাগ্রাফ',
            },
          },
          {
            label: { en: 'Essay Writing', bn: 'রচনা (Essay / Composition)' },
            href: '/written?type=Essay',
            description: {
              en: 'Structured comprehensive essays for exams',
              bn: 'পরীক্ষার প্রস্তুতিতে পূর্ণাঙ্গ ইংরেজি রচনা',
            },
          },
          {
            label: { en: 'Letters & Applications', bn: 'চিঠি ও দরখাস্ত' },
            href: '/written?type=Application',
            description: {
              en: 'Official letters, job applications, and emails',
              bn: 'অফিসিয়াল দরখাস্ত ও ফরমাল লেটার ফরম্যাট',
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
  const pathname = usePathname()
  const headerPage = getHeaderPage(pathname)

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
  const backHref = headerPage?.parentHref ?? (isLoggedIn ? '/dashboard' : '/')

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

  if (mounted && isLoggedIn) {
    return <LoggedInHeader />
  }

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
        <div className="relative z-40 w-full overflow-hidden border-b border-black/[0.04] bg-[#f8f8f6] text-[11px] sm:text-xs text-[#242423]/75 dark:border-white/[0.04] dark:bg-[#121214] dark:text-zinc-300">
          <div className="mx-auto flex h-8 max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
            <Link
              href={banner.href}
              className="group flex min-w-0 items-center gap-2 font-medium transition-colors hover:text-[#242423] dark:hover:text-white"
            >
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Sparkles className="size-2.5 shrink-0" />
                <span>{lang === 'en' ? 'NEW' : 'নতুন'}</span>
              </span>
              <span className="truncate text-[#242423]/80 group-hover:text-black dark:text-zinc-300 dark:group-hover:text-white">
                {lang === 'en' ? banner.text.en : banner.text.bn}
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1 shrink-0 text-xs">
              {banner.links.map((link) => (
                <Link
                  key={`${link.label.en}-${link.href}`}
                  href={link.href}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-[#242423]/60 transition-colors hover:bg-black/[0.04] hover:text-[#242423] dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                >
                  {lang === 'en' ? link.label.en : link.label.bn}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <motion.header
        initial={false}
        animate={{ y: isHidden ? '-100%' : '0%' }}
        transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          'sticky top-0 z-40 w-full transform-gpu transition-all duration-200',
          'bg-white/85 dark:bg-[#0c0c0e]/85 backdrop-blur-xl backdrop-saturate-150',
          isScrolled
            ? 'border-b border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.03),0_12px_28px_-12px_rgba(0,0,0,0.05)] dark:border-white/[0.08]'
            : 'border-b border-black/[0.04] dark:border-white/[0.05]'
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Logo on home/about, page title + back button elsewhere */}
          {headerPage ? (
            <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
              {pathname !== '/dashboard' && (
                <Link
                  href={backHref}
                  aria-label={lang === 'en' ? 'Go back' : 'ফিরে যান'}
                  title={lang === 'en' ? 'Go back' : 'ফিরে যান'}
                  className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
                >
                  <ArrowLeft className="size-4" />
                </Link>
              )}
              <span className="max-w-[42vw] truncate text-[14px] font-bold tracking-tight text-[#242423] sm:max-w-xs dark:text-[#f3f3f2]">
                {lang === 'en' ? headerPage.titleEn : headerPage.titleBn}
              </span>
            </div>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-transform hover:opacity-90 active:scale-95"
            >
              <Image
                src={logo}
                alt="Zero English"
                className="h-5 w-auto dark:brightness-0 dark:invert"
                priority
              />
            </Link>
          )}

          {/* Desktop Nav Mega Menus */}
          <DesktopNav items={NAV_ITEMS} hidden={isHidden} />

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={lang === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
              title={lang === 'bn' ? 'Switch to English' : 'Switch to Bangla'}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-full bg-[#f1f1ef] px-3 text-xs font-semibold text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
            >
              <Languages className="size-3.5" />
              <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                mounted && currentTheme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              className="flex size-8.5 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
            >
              {mounted &&
                (currentTheme === 'dark' ? (
                  <Sun className="size-4" />
                ) : (
                  <Moon className="size-4" />
                ))}
            </button>

            {/* User Session & Profile Menu */}
            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="User profile menu"
                    className="relative hidden size-8.5 shrink-0 overflow-hidden rounded-full ring-2 ring-black/[0.06] transition-all hover:ring-black/20 active:scale-95 md:inline-flex dark:ring-white/[0.1] dark:hover:ring-white/30"
                  >
                    <UserAvatar
                      id={(user as { id?: number }).id ?? 1}
                      name={user.name}
                      userName={user.name}
                      image={user.image}
                      size="sm"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={10}
                  className="w-56 rounded-[22px] border border-black/[0.06] bg-white/95 p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_24px_48px_-12px_rgba(0,0,0,0.12)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#1c1c1e]/95"
                >
                  <div className="rounded-[16px] bg-[#f1f1ef] p-2.5 dark:bg-[#252528]">
                    <p className="truncate text-xs font-bold text-[#242423] dark:text-[#f3f3f2]">
                      {user.name || 'Learner'}
                    </p>
                    {user.email && (
                      <p className="truncate text-[11px] text-[#242423]/60 dark:text-zinc-400">
                        {user.email}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/[0.08]" />
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                      <LayoutDashboard className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>{lang === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>{lang === 'en' ? 'My Profile & Words' : 'প্রোফাইল ও শব্দতালিকা'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openNotesDialog()}
                    className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer flex items-center gap-2.5"
                  >
                    <NotebookPen className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                    <span>{lang === 'en' ? 'My Notes' : 'আমার নোট'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer">
                    <Link href="/profile?tab=learned&type=grammar" className="flex items-center gap-2.5">
                      <GraduationCap className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>{lang === 'en' ? 'My Grammar Rules' : 'আমার ব্যাকরণ রুলস'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer">
                    <Link href="/leaderboard" className="flex items-center gap-2.5">
                      <Trophy className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                      <span>{lang === 'en' ? 'Leaderboard' : 'লিডারবোর্ড'}</span>
                    </Link>
                  </DropdownMenuItem>
                  {canContribute && (
                    <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer">
                      <Link href="/contribute" className="flex items-center gap-2.5">
                        <SquarePen className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                        <span>{lang === 'en' ? 'Contribute' : 'কন্ট্রিবিউট'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {isAdmin && (
                    <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2.5">
                        <Shield className="size-3.5 text-[#242423]/70 dark:text-zinc-400" />
                        <span>{lang === 'en' ? 'Admin Panel' : 'অ্যাডমিন প্যানেল'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-black/[0.06] dark:bg-white/[0.08]" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    variant="destructive"
                    className="rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer gap-2.5 text-rose-600 focus:text-rose-600 dark:text-rose-400"
                  >
                    <LogOut className="size-3.5" />
                    <span>{lang === 'en' ? 'Sign out' : 'লগ আউট'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/join"
                className="hidden h-8.5 items-center gap-1.5 rounded-full bg-[#242423] px-4 text-xs font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-95 md:inline-flex dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
              >
                <User className="size-3.5" />
                <span>{lang === 'en' ? 'Join' : 'যোগ দিন'}</span>
              </Link>
            )}

            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open mobile menu"
                  className="flex size-8.5 items-center justify-center rounded-full bg-[#f1f1ef] text-[#242423] transition-all hover:bg-[#e7e7e4] active:scale-95 md:hidden dark:bg-[#252528] dark:text-[#f3f3f2] dark:hover:bg-[#2e2e32]"
                >
                  <Menu className="size-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="flex w-80 flex-col gap-0 border-r border-black/[0.06] bg-white/95 p-0 text-[#242423] shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#1c1c1e]/95 dark:text-[#f3f3f2]"
                showCloseButton={false}
              >
                {/* Sunken Drawer Header Module */}
                <div className="m-3 flex items-center justify-between rounded-[20px] bg-[#f1f1ef] p-3 dark:bg-[#252528]">
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
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="flex size-8 items-center justify-center rounded-full bg-white text-[#242423] shadow-xs transition-all hover:bg-zinc-100 active:scale-95 dark:bg-[#1c1c1e] dark:text-[#f3f3f2] dark:hover:bg-zinc-800"
                    >
                      <X className="size-3.5" />
                    </button>
                  </SheetClose>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-2">
                  <SheetTitle className="sr-only">
                    {lang === 'en' ? 'Navigation Menu' : 'নেভিগেশন মেনু'}
                  </SheetTitle>
                  <MobileNav
                    items={MOBILE_ITEMS}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>

                {/* Sunken Drawer Footer Module */}
                <div className="m-3 rounded-[22px] bg-[#f1f1ef] p-3 dark:bg-[#252528] space-y-1.5">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#242423]/80 transition-all hover:bg-white active:scale-[0.98] dark:text-zinc-200 dark:hover:bg-[#1c1c1e]"
                      >
                        <LayoutDashboard className="size-4 shrink-0" />
                        <span>{lang === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড'}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false)
                          handleSignOut()
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-all hover:bg-rose-500/10 active:scale-[0.98] dark:text-rose-400"
                      >
                        <LogOut className="size-4 shrink-0" />
                        <span>{lang === 'en' ? 'Log out' : 'লগ আউট'}</span>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/join"
                      onClick={() => setMobileOpen(false)}
                      className="flex h-10 w-full items-center justify-center rounded-full bg-[#242423] text-xs font-semibold text-white shadow-xs transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-[#242423] dark:hover:bg-zinc-200"
                    >
                      {lang === 'en' ? 'Join Zero English' : 'জিরো ইংলিশে যোগ দিন'}
                    </Link>
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

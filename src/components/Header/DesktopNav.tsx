'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import { requestGoogleLogin } from '@/lib/login-required'

const CLOSE_DELAY_MS = 220

export type LocalizedText = {
  en: string
  bn: string
}

export type NavLink = {
  label: LocalizedText
  href: string
  description?: LocalizedText
  image?: string
}

export type NavColumn = {
  title?: LocalizedText
  links: NavLink[]
}

export type NavItem = {
  label: LocalizedText
  href: string
  columns: NavColumn[]
}

export function DesktopNav({
  items,
  hidden,
}: {
  items: NavItem[]
  hidden: boolean
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [wasHidden, setWasHidden] = useState(hidden)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname = usePathname()
  const [lastPathname, setLastPathname] = useState(pathname)
  const { lang } = useLanguage()

  const t = useCallback(
    (text?: LocalizedText) => (text ? (lang === 'en' ? text.en : text.bn) : ''),
    [lang]
  )

  const clearClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearClose()
    closeTimer.current = setTimeout(() => setActiveIndex(null), CLOSE_DELAY_MS)
  }, [clearClose])

  const open = useCallback(
    (i: number) => {
      clearClose()
      setActiveIndex(i)
    },
    [clearClose]
  )

  const close = useCallback(() => {
    clearClose()
    setActiveIndex(null)
  }, [clearClose])

  if (hidden !== wasHidden) {
    setWasHidden(hidden)
    if (hidden) setActiveIndex(null)
  }

  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setActiveIndex(null)
  }

  useEffect(() => {
    if (activeIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeIndex, close])

  const activeColumns = activeIndex !== null ? items[activeIndex]?.columns ?? [] : []
  const hasDropdown = activeColumns.length > 0

  return (
    <nav
      className="hidden items-center gap-1 md:flex"
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) scheduleClose()
      }}
    >
      {items.map((item, i) => {
        const isActive = activeIndex === i
        const isCurrentRoute =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        const hasChildren = item.columns.length > 0
        const triggerClass = cn(
          'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all outline-none active:scale-95',
          isActive
            ? 'bg-[#242423] text-white shadow-xs dark:bg-white dark:text-[#242423]'
            : isCurrentRoute
              ? 'bg-[#242423]/[0.08] text-[#242423] dark:bg-white/[0.1] dark:text-white'
              : 'text-[#242423]/70 hover:bg-[#242423]/[0.05] hover:text-[#242423] dark:text-zinc-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
        )
        return (
          <div
            key={item.href}
            onMouseEnter={() => open(i)}
            onFocus={() => open(i)}
          >
            {hasChildren ? (
              <Link
                href={item.href}
                aria-haspopup="true"
                aria-expanded={isActive}
                className={cn(triggerClass, 'flex items-center gap-1.5')}
              >
                <span>{t(item.label)}</span>
                <ChevronDown
                  className={cn(
                    'size-3 transition-transform duration-200',
                    isActive && 'rotate-180'
                  )}
                />
              </Link>
            ) : (
              <Link href={item.href} className={triggerClass}>
                {t(item.label)}
              </Link>
            )}
          </div>
        )
      })}

      <AnimatePresence>
        {hasDropdown && (
          <motion.div
            key="mega-menu"
            initial={{ opacity: 0, y: 6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            onMouseEnter={clearClose}
            onMouseLeave={scheduleClose}
            className="absolute left-1/2 top-[calc(100%+8px)] z-50 -translate-x-1/2 w-[92vw] max-w-4xl rounded-[28px] border border-black/[0.06] bg-white/95 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06),0_24px_48px_-12px_rgba(0,0,0,0.1)] backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#1c1c1e]/95"
          >
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {activeColumns.map((col, ci) => (
                <div key={ci} className="min-w-56 flex-1">
                  {col.title && (
                    <p className="mb-2 px-1 text-[11px] font-bold tracking-wider text-[#242423]/45 uppercase dark:text-zinc-400">
                      {t(col.title)}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {col.links.map((link) => (
                      <li key={`${link.label.en}-${link.href}`}>
                        <Link
                          href={link.href}
                          onClick={(e) => {
                            if (link.href === '/quiz/daily' && requestGoogleLogin()) {
                              e.preventDefault()
                              close()
                              return
                            }
                            close()
                          }}
                          className="group flex items-start gap-3 rounded-[16px] p-2.5 transition-all hover:bg-[#f1f1ef] active:scale-[0.98] dark:hover:bg-[#252528]"
                        >
                          {link.image && (
                            <span className="relative size-10 shrink-0 overflow-hidden rounded-[12px] bg-[#f1f1ef] dark:bg-[#252528]">
                              <Image
                                src={link.image}
                                alt={t(link.label)}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-[#242423] transition-colors group-hover:text-black dark:text-[#f3f3f2] dark:group-hover:text-white">
                              {t(link.label)}
                            </span>
                            {link.description && (
                              <span className="mt-0.5 block text-[11px] leading-snug text-[#242423]/60 dark:text-zinc-400">
                                {t(link.description)}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

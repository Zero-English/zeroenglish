'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'

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
          'rounded-md px-3 py-1.5 text-xs font-medium transition-colors outline-none text-foreground/80 hover:text-foreground hover:bg-muted/80',
          isActive && 'bg-muted text-foreground',
          isCurrentRoute && 'text-primary font-semibold'
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
                className={cn(triggerClass, 'flex items-center gap-1')}
              >
                {t(item.label)}
                <ChevronDown
                  className={cn(
                    'size-3 transition-transform duration-200',
                    isActive && 'rotate-180 text-primary'
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
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            onMouseEnter={clearClose}
            onMouseLeave={scheduleClose}
            className="absolute inset-x-0 top-full z-50 border-b border-border bg-background/95 backdrop-blur-md shadow-lg"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap gap-8 px-6 py-6 md:px-8">
              {activeColumns.map((col, ci) => (
                <div key={ci} className="min-w-56 flex-1">
                  {col.title && (
                    <p className="mb-2.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                      {t(col.title)}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {col.links.map((link) => (
                      <li key={`${link.label.en}-${link.href}`}>
                        <Link
                          href={link.href}
                          onClick={close}
                          className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/80 active:bg-muted"
                        >
                          {link.image && (
                            <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                              <Image
                                src={link.image}
                                alt={t(link.label)}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </span>
                          )}
                          <span>
                            <span className="block text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                              {t(link.label)}
                            </span>
                            {link.description && (
                              <span className="mt-0.5 block text-[11px] text-muted-foreground leading-tight">
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

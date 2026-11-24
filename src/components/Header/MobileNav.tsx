'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import { requestGoogleLogin } from '@/lib/login-required'
import type { LocalizedText } from '@/components/Header/DesktopNav'

const linkClass =
  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-[#242423]/80 transition-all hover:bg-[#f1f1ef] active:scale-[0.98] dark:text-zinc-200 dark:hover:bg-[#252528]'

export type MobileNavItem = {
  label: LocalizedText
  href: string
  children: { label: LocalizedText; href: string }[]
}

export function MobileNav({
  items,
  onNavigate,
}: {
  items: MobileNavItem[]
  onNavigate: () => void
}) {
  const pathname = usePathname()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { lang } = useLanguage()

  const t = useCallback(
    (text?: LocalizedText) => (text ? (lang === 'en' ? text.en : text.bn) : ''),
    [lang]
  )

  return (
    <div className="flex flex-col space-y-1">
      {items.map((item, i) => {
        const hasChildren = item.children.length > 0
        const isOpen = openIndex === i
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <div key={`${item.label.en}-${item.href}`}>
            {hasChildren ? (
              <div className="flex w-full items-center gap-1">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    linkClass,
                    'flex-1',
                    isActive && 'bg-[#242423]/[0.08] text-[#242423] font-bold dark:bg-white/[0.1] dark:text-white'
                  )}
                >
                  {t(item.label)}
                </Link>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={t(
                    { en: `Toggle ${item.label.en} submenu`, bn: `${item.label.bn} সাবমেনু টগল করুন` }
                  )}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#242423]/60 transition-all hover:bg-[#f1f1ef] hover:text-[#242423] active:scale-95 dark:text-zinc-400 dark:hover:bg-[#252528] dark:hover:text-white"
                >
                  <ChevronDown
                    className={cn(
                      'size-3.5 transition-transform duration-200',
                      isOpen && 'rotate-180 text-[#242423] dark:text-white'
                    )}
                  />
                </button>
              </div>
            ) : (
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  linkClass,
                  isActive && 'bg-[#242423]/[0.08] text-[#242423] font-bold dark:bg-white/[0.1] dark:text-white'
                )}
              >
                {t(item.label)}
              </Link>
            )}

            {hasChildren && (
              <div
                className={cn(
                  'my-1 ml-2 overflow-hidden rounded-[16px] bg-[#f1f1ef]/60 p-1 transition-all duration-200 dark:bg-[#252528]/60 space-y-0.5',
                  isOpen ? 'max-h-96 py-1.5' : 'max-h-0 py-0'
                )}
              >
                {item.children.map((child) => (
                  <Link
                    key={`${child.label.en}-${child.href}`}
                    href={child.href}
                    onClick={(e) => {
                      if (child.href === '/quiz/daily' && requestGoogleLogin()) {
                        e.preventDefault()
                        onNavigate()
                        return
                      }
                      onNavigate()
                    }}
                    className={cn(
                      'block rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#242423]/70 transition-all hover:bg-white hover:text-[#242423] active:scale-[0.98] dark:text-zinc-400 dark:hover:bg-[#1c1c1e] dark:hover:text-white',
                      pathname === child.href &&
                        'bg-white font-semibold text-[#242423] shadow-2xs dark:bg-[#1c1c1e] dark:text-white'
                    )}
                  >
                    <span>{t(child.label)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

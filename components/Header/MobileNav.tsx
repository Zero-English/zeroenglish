'use client'

import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/components/language-provider'
import type { LocalizedText } from '@/components/Header/DesktopNav'

const linkClass =
  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent'

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
    <div className="flex flex-col space-y-0.5">
      {items.map((item, i) => {
        const hasChildren = item.children.length > 0
        const isOpen = openIndex === i
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
        return (
          <div key={`${item.label.en}-${item.href}`}>
            {hasChildren ? (
              <div className="flex w-full items-center">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    linkClass,
                    'flex-1',
                    isActive && 'font-semibold text-primary'
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
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <ChevronDown
                    className={cn(
                      'size-4 transition-transform duration-200',
                      isOpen && 'rotate-180 text-primary'
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
                  isActive && 'bg-sidebar-accent font-semibold text-primary'
                )}
              >
                {t(item.label)}
              </Link>
            )}

            {hasChildren && (
              <div
                className={cn(
                  'ml-3 overflow-hidden border-l border-sidebar-border pl-2 transition-all duration-200',
                  isOpen ? 'max-h-96 py-1' : 'max-h-0'
                )}
              >
                {item.children.map((child) => (
                  <Link
                    key={`${child.label.en}-${child.href}`}
                    href={child.href}
                    onClick={onNavigate}
                    className={cn(
                      linkClass,
                      'py-1.5 text-sidebar-foreground/70',
                      pathname === child.href &&
                        'font-semibold text-primary'
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

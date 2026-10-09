"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { MouseEvent, ReactNode } from "react";

type HardNavLinkProps = Omit<LinkProps, "href"> & {
  href: string;
  className?: string;
  children: ReactNode;
};

export function HardNavLink({
  href,
  className,
  children,
  ...rest
}: HardNavLinkProps) {
  return (
    <Link
      {...rest}
      href={href}
      className={className}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }
        event.preventDefault();
        window.location.href = href;
      }}
    >
      {children}
    </Link>
  );
}
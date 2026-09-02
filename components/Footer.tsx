"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowRight } from "lucide-react";
import logo from "../public/assets/logo.png";

export default function FFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: "Features", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Blog", href: "#" },
    ],
    Learning: [
      { label: "Beginner", href: "/beginner" },
      { label: "Intermediate", href: "/intermediate" },
      { label: "Advanced", href: "/advanced" },
    ],
    Company: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Mail, href: "zeroenglishweb@gmail.com", label: "Email" },
  ];

  return (
    <footer className="border-t border-border bg-muted/40 text-muted-foreground mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5 max-w-sm">
            <Link href="/" className="inline-flex items-center space-x-2">
              <Image
                src={logo}
                alt="Zero English"
                className="h-6 w-auto dark:brightness-0 dark:invert"
              />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Master English vocabulary at your own pace with our comprehensive
              learning platform.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={`mailto:${href}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary"
                  aria-label={label}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="lg:col-span-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-5">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={`${category}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-border mt-12 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} Zero English. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

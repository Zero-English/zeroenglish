import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-secondary text-secondary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-foreground",
        primary:
          "border-transparent bg-primary/10 text-primary",
        level: "border-transparent bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
        category:
          "border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
        pos: "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
        destructive: "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

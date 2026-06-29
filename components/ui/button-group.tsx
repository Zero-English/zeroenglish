import * as React from "react"

import { cn } from "@/lib/utils"

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="button-group"
      className={cn(
        "flex items-center gap-0 rounded-md border border-border bg-transparent has-data-[slot=input]:focus-within:border-ring has-data-[slot=input]:focus-within:ring-2 has-data-[slot=input]:focus-within:ring-ring/30",
        className
      )}
      {...props}
    />
  )
}

export { ButtonGroup }

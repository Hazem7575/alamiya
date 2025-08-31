import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Light Metronic-style colors
        light_blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        light_green: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        light_red: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        light_purple: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        light_pink: "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100",
        light_orange: "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        light_yellow: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        light_teal: "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100",
        light_indigo: "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        light_cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
        light_emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        light_violet: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
        light_rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        light_amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        light_slate: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

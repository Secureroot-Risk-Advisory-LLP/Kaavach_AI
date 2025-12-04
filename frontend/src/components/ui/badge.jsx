import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-cyan-500/10 text-cyan-100 border-cyan-500/40",
        success: "bg-emerald-500/10 text-emerald-200 border-emerald-400/60",
        warning: "bg-amber-500/10 text-amber-200 border-amber-400/60",
        destructive: "bg-red-500/10 text-red-200 border-red-400/60",
        outline: "border-white/20 text-white",
        ghost: "bg-transparent text-muted-foreground border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { badgeVariants }


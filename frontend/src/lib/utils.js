import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to conditionally combine classNames with tailwind-merge support.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const motionTransitions = {
  layout: { type: "spring", stiffness: 120, damping: 20 },
  fade: { duration: 0.25, ease: "easeOut" },
}


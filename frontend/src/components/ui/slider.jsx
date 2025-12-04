import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

export function Slider({ className, ...props }) {
  const thumbCount =
    props?.value?.length ??
    props?.defaultValue?.length ??
    (typeof props?.value === "number" || typeof props?.defaultValue === "number" ? 1 : 2)

  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-white/10">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500" />
      </SliderPrimitive.Track>
      {Array.from({ length: thumbCount }).map((_, idx) => (
        <SliderPrimitive.Thumb
          key={idx}
          className="block h-4 w-4 rounded-full border border-white/40 bg-white shadow shadow-cyan-500/25 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400/30 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}


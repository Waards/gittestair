"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  status?: 'pending' | 'in_progress' | 'completed' | 'default'
}

function Progress({
  className,
  value,
  status = 'default',
  ...props
}: ProgressProps) {
  const progressValue = value ?? 0
  
  const getColorClass = () => {
    if (progressValue >= 100 || status === 'completed') return 'bg-green-500'
    if (progressValue > 0 || status === 'in_progress') return 'bg-orange-500'
    return 'bg-primary'
  }
  
  const isAnimating = (progressValue > 0 && progressValue < 100) || status === 'in_progress'
  
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-slate-200 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-all duration-500",
          getColorClass(),
          isAnimating && "animate-progress"
        )}
        style={{ transform: `translateX(-${100 - progressValue}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }

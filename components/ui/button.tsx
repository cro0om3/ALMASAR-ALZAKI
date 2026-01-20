import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-800 to-blue-900 dark:from-blue-700 dark:to-blue-800 text-white hover:from-blue-900 hover:to-blue-950 dark:hover:from-blue-800 dark:hover:to-blue-900 shadow-blue hover:shadow-lg",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
        outline:
          "border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-50 dark:hover:bg-blue-800 hover:border-blue-500 dark:hover:border-blue-600 shadow-sm hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-500 text-blue-900 dark:text-blue-950 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-600 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 dark:border-yellow-400/50",
        gold: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-400 dark:to-yellow-500 text-blue-900 dark:text-blue-950 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-400 dark:hover:via-yellow-500 dark:hover:to-yellow-600 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 dark:border-yellow-400/50 px-6 py-3",
        ghost: "hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-800 dark:hover:text-blue-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

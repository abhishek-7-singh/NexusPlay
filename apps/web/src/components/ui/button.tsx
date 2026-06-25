import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-base-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-accent-blue text-base-900 hover:bg-accent-blue/90 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
        destructive:
          "bg-red-500 text-white hover:bg-red-500/90",
        outline:
          "border border-base-700 bg-transparent hover:bg-base-800 hover:text-white",
        secondary:
          "bg-base-800 text-white hover:bg-base-700 border border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        ghost: "hover:bg-base-800 hover:text-white text-text-secondary",
        link: "text-accent-blue underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
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
    const Comp = asChild ? "slot" : "button"
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

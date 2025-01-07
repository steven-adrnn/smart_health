import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HTMLMotionProps } from "framer-motion"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & HTMLMotionProps<"input">;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref as React.Ref<HTMLInputElement>}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...(props as HTMLMotionProps<"input">)} // Cast props ke tipe yang benar
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

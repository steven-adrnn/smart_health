import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HTMLMotionProps } from "framer-motion"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & 
  HTMLMotionProps<"input"> & {
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type,
    ...props 
  }, ref) => {
    return (
      <motion.input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-primary/30 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm hover:border-primary/50 transition-all duration-300",
          className
        )}
        ref={ref as React.Ref<HTMLInputElement>}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
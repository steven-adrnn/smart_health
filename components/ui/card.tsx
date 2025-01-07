import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { HTMLMotionProps } from "framer-motion"

type CardProps = React.HTMLAttributes<HTMLDivElement> & HTMLMotionProps<"div">;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref as React.Ref<HTMLDivElement>}
      whileHover={{
        scale: 1.03,
        boxShadow: "0 15px 30px rgba(46, 204, 113, 0.1)"
      }}
      transition={{ type: "spring", stiffness: 300 }}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-300",
        className
      )}
      {...(props as HTMLMotionProps<"div">)} // Cast props ke tipe yang benar
    />
  )
)
Card.displayName = "Card"

// Komponen lainnya tidak perlu diubah, karena tidak menggunakan Framer Motion
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 bg-muted/20", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-primary",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent
}

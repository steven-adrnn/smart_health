import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { motion } from "framer-motion"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Reusable Animation Variants
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const AnimatedDiv = motion.div
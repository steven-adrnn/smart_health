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

export function generateAvatarFromName(name: string, size: number = 40): string {
  // Ambil inisial
  const initials = name
    .split(' ')
    .map(word => word[0].toUpperCase())
    .slice(0, 2)
    .join('');

  // Buat canvas untuk generate avatar
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context) return '';

  // Warna background acak namun konsisten
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // Gambar background
  context.fillStyle = getColorFromName(name);
  context.fillRect(0, 0, size, size);

  // Tulis inisial
  context.fillStyle = 'white';
  context.font = `${size * 0.5}px Arial`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initials, size / 2, size / 2);

  return canvas.toDataURL();
}

export const AnimatedDiv = motion.div
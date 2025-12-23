import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently
 * Usage: cn("p-4", isActive && "bg-blue-500")
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

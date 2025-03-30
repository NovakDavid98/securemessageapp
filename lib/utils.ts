/**
 * Utility functions for the application
 */

// Combine class names
export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

// Generate a random ID
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length)
}

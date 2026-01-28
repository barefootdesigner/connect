import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanFileName(filename: string): string {
  // Find the last dot to separate name and extension
  const lastDotIndex = filename.lastIndexOf('.');

  if (lastDotIndex === -1) {
    // No extension, just clean the whole filename
    return filename
      .replace(/[-\s]*\(?\d+\)?$/g, '') // Remove trailing numbers
      .replace(/[-\s]*WEB[-\s]*/gi, '') // Remove WEB
      .trim();
  }

  const name = filename.substring(0, lastDotIndex);
  const extension = filename.substring(lastDotIndex);

  // Remove trailing numbers with optional hyphens, spaces, or parentheses
  // Also remove "WEB" with optional hyphens or spaces around it
  const cleanedName = name
    .replace(/[-\s]*\(?\d+\)?$/g, '')
    .replace(/[-\s]*WEB[-\s]*/gi, '')
    .trim();

  return cleanedName + extension;
}

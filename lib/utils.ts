import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  const [firstName, lastName] = name.split(" ");
  if (firstName && lastName)
    return `${firstName[0]} ${lastName[0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

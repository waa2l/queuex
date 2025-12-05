import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toArabicNums = (num: number | string) => {
  const map = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
  return num.toString().replace(/\d/g, (d) => map[Number(d)]);
};

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, includeDecimals = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹ 0";
  const num = Math.round(amount * 100) / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: 0,
  }).format(num);
  return `₹ ${formatted}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getTodayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

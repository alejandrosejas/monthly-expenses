import { format, parse } from 'date-fns';

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Formats a Date object to YYYY-MM string (for month representation)
 */
export function formatMonth(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Parses a YYYY-MM-DD string to a Date object
 */
export function parseDate(dateString: string): Date {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

/**
 * Parses a YYYY-MM string to a Date object (first day of month)
 */
export function parseMonth(monthString: string): Date {
  return parse(monthString, 'yyyy-MM', new Date());
}

/**
 * Formats a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Generates a color based on a string (for consistent category colors)
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

/**
 * Calculates the percentage of a value against a total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Groups expenses by category and calculates totals
 */
export function groupExpensesByCategory(expenses: Array<{ category: string; amount: number }>) {
  return expenses.reduce<Record<string, number>>((acc, expense) => {
    const { category, amount } = expense;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength - 3)}...`;
}
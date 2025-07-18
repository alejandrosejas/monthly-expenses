import { format, parse, isValid, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Format a date string to display format
 */
export function formatDate(dateString: string): string {
  const date = parse(dateString, 'yyyy-MM-dd', new Date());
  if (!isValid(date)) {
    return 'Invalid date';
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Format a date to ISO format (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format a month to YYYY-MM format
 */
export function formatYearMonth(date: Date): string {
  return format(date, 'yyyy-MM');
}

/**
 * Get the first day of a month
 */
export function getMonthStart(yearMonth: string): string {
  const date = parse(yearMonth, 'yyyy-MM', new Date());
  if (!isValid(date)) {
    return '';
  }
  return toISODateString(startOfMonth(date));
}

/**
 * Get the last day of a month
 */
export function getMonthEnd(yearMonth: string): string {
  const date = parse(yearMonth, 'yyyy-MM', new Date());
  if (!isValid(date)) {
    return '';
  }
  return toISODateString(endOfMonth(date));
}

/**
 * Format a month for display (e.g., "January 2023")
 */
export function formatMonthYear(yearMonth: string): string {
  const date = parse(yearMonth, 'yyyy-MM', new Date());
  if (!isValid(date)) {
    return 'Invalid month';
  }
  return format(date, 'MMMM yyyy');
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

/**
 * Get previous month in YYYY-MM format
 */
export function getPreviousMonth(yearMonth: string): string {
  const date = parse(yearMonth, 'yyyy-MM', new Date());
  if (!isValid(date)) {
    return getCurrentMonth();
  }
  const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return format(prevMonth, 'yyyy-MM');
}

/**
 * Get next month in YYYY-MM format
 */
export function getNextMonth(yearMonth: string): string {
  const date = parse(yearMonth, 'yyyy-MM', new Date());
  if (!isValid(date)) {
    return getCurrentMonth();
  }
  const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return format(nextMonth, 'yyyy-MM');
}
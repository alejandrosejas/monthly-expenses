/**
 * Get the first day of a month in YYYY-MM-DD format
 */
export function getMonthStart(yearMonth: string): string {
  return `${yearMonth}-01`;
}

/**
 * Get the last day of a month in YYYY-MM-DD format
 */
export function getMonthEnd(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  
  // Get the last day of the month
  // Month is 0-indexed in JavaScript Date, so we use the next month's 0th day (which is the last day of the current month)
  const lastDay = new Date(year, month, 0).getDate();
  
  return `${yearMonth}-${lastDay.toString().padStart(2, '0')}`;
}

/**
 * Get previous month in YYYY-MM format
 */
export function getPreviousMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  
  // Calculate previous month
  let prevMonth = month - 1;
  let prevYear = year;
  
  if (prevMonth === 0) {
    prevMonth = 12;
    prevYear -= 1;
  }
  
  return `${prevYear}-${prevMonth.toString().padStart(2, '0')}`;
}

/**
 * Get next month in YYYY-MM format
 */
export function getNextMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  
  // Calculate next month
  let nextMonth = month + 1;
  let nextYear = year;
  
  if (nextMonth === 13) {
    nextMonth = 1;
    nextYear += 1;
  }
  
  return `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
}

/**
 * Format a month for display (e.g., "January 2023")
 */
export function formatMonthYear(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
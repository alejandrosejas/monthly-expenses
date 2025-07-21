/**
 * Formats a Date object to YYYY-MM-DD string
 */
export declare function formatDate(date: Date): string;
/**
 * Formats a Date object to YYYY-MM string (for month representation)
 */
export declare function formatMonth(date: Date): string;
/**
 * Parses a YYYY-MM-DD string to a Date object
 */
export declare function parseDate(dateString: string): Date;
/**
 * Parses a YYYY-MM string to a Date object (first day of month)
 */
export declare function parseMonth(monthString: string): Date;
/**
 * Formats a number as currency (USD)
 */
export declare function formatCurrency(amount: number): string;
/**
 * Generates a color based on a string (for consistent category colors)
 */
export declare function generateColorFromString(str: string): string;
/**
 * Calculates the percentage of a value against a total
 */
export declare function calculatePercentage(value: number, total: number): number;
/**
 * Groups expenses by category and calculates totals
 */
export declare function groupExpensesByCategory(expenses: Array<{
    category: string;
    amount: number;
}>): Record<string, number>;
/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
export declare function truncateText(text: string, maxLength: number): string;

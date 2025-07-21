"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatMonth = formatMonth;
exports.parseDate = parseDate;
exports.parseMonth = parseMonth;
exports.formatCurrency = formatCurrency;
exports.generateColorFromString = generateColorFromString;
exports.calculatePercentage = calculatePercentage;
exports.groupExpensesByCategory = groupExpensesByCategory;
exports.truncateText = truncateText;
const date_fns_1 = require("date-fns");
/**
 * Formats a Date object to YYYY-MM-DD string
 */
function formatDate(date) {
    return (0, date_fns_1.format)(date, 'yyyy-MM-dd');
}
/**
 * Formats a Date object to YYYY-MM string (for month representation)
 */
function formatMonth(date) {
    return (0, date_fns_1.format)(date, 'yyyy-MM');
}
/**
 * Parses a YYYY-MM-DD string to a Date object
 */
function parseDate(dateString) {
    return (0, date_fns_1.parse)(dateString, 'yyyy-MM-dd', new Date());
}
/**
 * Parses a YYYY-MM string to a Date object (first day of month)
 */
function parseMonth(monthString) {
    return (0, date_fns_1.parse)(monthString, 'yyyy-MM', new Date());
}
/**
 * Formats a number as currency (USD)
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
}
/**
 * Generates a color based on a string (for consistent category colors)
 */
function generateColorFromString(str) {
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
function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100);
}
/**
 * Groups expenses by category and calculates totals
 */
function groupExpensesByCategory(expenses) {
    return expenses.reduce((acc, expense) => {
        const { category, amount } = expense;
        acc[category] = (acc[category] || 0) + amount;
        return acc;
    }, {});
}
/**
 * Truncates text to a specified length and adds ellipsis if needed
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength)
        return text;
    return `${text.substring(0, maxLength - 3)}...`;
}

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatMonth,
  parseDate,
  parseMonth,
  formatCurrency,
  generateColorFromString,
  calculatePercentage,
  groupExpensesByCategory,
  truncateText
} from './utils';

describe('Date utilities', () => {
  it('formats a date to YYYY-MM-DD', () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    expect(formatDate(date)).toBe('2023-01-15');
  });

  it('formats a date to YYYY-MM', () => {
    const date = new Date(2023, 0, 15); // January 15, 2023
    expect(formatMonth(date)).toBe('2023-01');
  });

  it('parses a YYYY-MM-DD string to a Date', () => {
    const dateStr = '2023-01-15';
    const parsed = parseDate(dateStr);
    expect(parsed.getFullYear()).toBe(2023);
    expect(parsed.getMonth()).toBe(0); // January is 0
    expect(parsed.getDate()).toBe(15);
  });

  it('parses a YYYY-MM string to a Date', () => {
    const monthStr = '2023-01';
    const parsed = parseMonth(monthStr);
    expect(parsed.getFullYear()).toBe(2023);
    expect(parsed.getMonth()).toBe(0); // January is 0
  });
});

describe('Formatting utilities', () => {
  it('formats a number as USD currency', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(-1234.56)).toBe('-$1,234.56');
  });

  it('truncates text with ellipsis when too long', () => {
    expect(truncateText('Short text', 20)).toBe('Short text');
    expect(truncateText('This is a very long text that should be truncated', 20)).toBe('This is a very lo...');
  });
});

describe('Color generation', () => {
  it('generates consistent colors for the same string', () => {
    const color1 = generateColorFromString('Food');
    const color2 = generateColorFromString('Food');
    const color3 = generateColorFromString('Transportation');
    
    expect(color1).toBe(color2);
    expect(color1).not.toBe(color3);
    expect(color1).toMatch(/^hsl\(\d+, 65%, 55%\)$/);
  });
});

describe('Calculation utilities', () => {
  it('calculates percentage correctly', () => {
    expect(calculatePercentage(25, 100)).toBe(25);
    expect(calculatePercentage(0, 100)).toBe(0);
    expect(calculatePercentage(50, 0)).toBe(0); // Avoid division by zero
  });

  it('groups expenses by category and calculates totals', () => {
    const expenses = [
      { category: 'Food', amount: 100 },
      { category: 'Transportation', amount: 50 },
      { category: 'Food', amount: 75 },
      { category: 'Entertainment', amount: 120 }
    ];
    
    const grouped = groupExpensesByCategory(expenses);
    
    expect(grouped).toEqual({
      Food: 175,
      Transportation: 50,
      Entertainment: 120
    });
  });
});
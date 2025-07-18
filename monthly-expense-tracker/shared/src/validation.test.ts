import { describe, it, expect } from 'vitest';
import {
  ExpenseSchema,
  FullExpenseSchema,
  CategorySchema,
  FullCategorySchema,
  BudgetSchema,
  FullBudgetSchema,
  PaymentMethod
} from './validation';

describe('ExpenseSchema validation', () => {
  it('validates a valid expense', () => {
    const validExpense = {
      date: '2023-01-15',
      amount: 42.99,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: PaymentMethod.CREDIT
    };
    
    const result = ExpenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validExpense);
    }
  });

  it('transforms amount to have exactly 2 decimal places', () => {
    const expense = {
      date: '2023-01-15',
      amount: 42.999,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: PaymentMethod.CREDIT
    };
    
    const result = ExpenseSchema.safeParse(expense);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(43.00);
    }
  });

  it('rejects invalid date format', () => {
    const invalidExpense = {
      date: '01/15/2023', // Wrong format
      amount: 42.99,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: PaymentMethod.CREDIT
    };
    
    const result = ExpenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const invalidExpense = {
      date: '2023-01-15',
      amount: -42.99,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: PaymentMethod.CREDIT
    };
    
    const result = ExpenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });

  it('rejects invalid payment method', () => {
    const invalidExpense = {
      date: '2023-01-15',
      amount: 42.99,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: 'bitcoin' // Invalid payment method
    };
    
    const result = ExpenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });
});

describe('FullExpenseSchema validation', () => {
  it('validates a complete expense record', () => {
    const fullExpense = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      date: '2023-01-15',
      amount: 42.99,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: PaymentMethod.CREDIT,
      createdAt: '2023-01-15T12:00:00Z',
      updatedAt: '2023-01-15T12:00:00Z'
    };
    
    const result = FullExpenseSchema.safeParse(fullExpense);
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID', () => {
    const invalidExpense = {
      id: 'not-a-uuid',
      date: '2023-01-15',
      amount: 42.99,
      category: 'Food',
      description: 'Groceries',
      paymentMethod: PaymentMethod.CREDIT,
      createdAt: '2023-01-15T12:00:00Z',
      updatedAt: '2023-01-15T12:00:00Z'
    };
    
    const result = FullExpenseSchema.safeParse(invalidExpense);
    expect(result.success).toBe(false);
  });
});

describe('CategorySchema validation', () => {
  it('validates a valid category', () => {
    const validCategory = {
      name: 'Food',
      color: '#FF5733'
    };
    
    const result = CategorySchema.safeParse(validCategory);
    expect(result.success).toBe(true);
  });

  it('rejects empty category name', () => {
    const invalidCategory = {
      name: '',
      color: '#FF5733'
    };
    
    const result = CategorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });

  it('rejects invalid color format', () => {
    const invalidCategory = {
      name: 'Food',
      color: 'red' // Not a hex color
    };
    
    const result = CategorySchema.safeParse(invalidCategory);
    expect(result.success).toBe(false);
  });
});

describe('FullCategorySchema validation', () => {
  it('validates a complete category record', () => {
    const fullCategory = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Food',
      color: '#FF5733',
      isDefault: true,
      createdAt: '2023-01-15T12:00:00Z'
    };
    
    const result = FullCategorySchema.safeParse(fullCategory);
    expect(result.success).toBe(true);
  });

  it('sets isDefault to false when not provided', () => {
    const category = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Food',
      color: '#FF5733',
      createdAt: '2023-01-15T12:00:00Z'
    };
    
    const result = FullCategorySchema.safeParse(category);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isDefault).toBe(false);
    }
  });
});

describe('BudgetSchema validation', () => {
  it('validates a valid budget', () => {
    const validBudget = {
      month: '2023-01',
      totalBudget: 1000,
      categoryBudgets: {
        'Food': 300,
        'Transportation': 200,
        'Entertainment': 100
      }
    };
    
    const result = BudgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
  });

  it('transforms budget amounts to have exactly 2 decimal places', () => {
    const budget = {
      month: '2023-01',
      totalBudget: 1000.999,
      categoryBudgets: {
        'Food': 300.555,
        'Transportation': 200
      }
    };
    
    const result = BudgetSchema.safeParse(budget);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalBudget).toBe(1001.00);
    }
  });

  it('rejects invalid month format', () => {
    const invalidBudget = {
      month: '01/2023', // Wrong format
      totalBudget: 1000,
      categoryBudgets: {}
    };
    
    const result = BudgetSchema.safeParse(invalidBudget);
    expect(result.success).toBe(false);
  });

  it('rejects negative budget amount', () => {
    const invalidBudget = {
      month: '2023-01',
      totalBudget: -1000,
      categoryBudgets: {}
    };
    
    const result = BudgetSchema.safeParse(invalidBudget);
    expect(result.success).toBe(false);
  });

  it('rejects negative category budget', () => {
    const invalidBudget = {
      month: '2023-01',
      totalBudget: 1000,
      categoryBudgets: {
        'Food': -300
      }
    };
    
    const result = BudgetSchema.safeParse(invalidBudget);
    expect(result.success).toBe(false);
  });
});

describe('FullBudgetSchema validation', () => {
  it('validates a complete budget record', () => {
    const fullBudget = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      month: '2023-01',
      totalBudget: 1000,
      categoryBudgets: {
        'Food': 300,
        'Transportation': 200
      },
      createdAt: '2023-01-01T12:00:00Z',
      updatedAt: '2023-01-01T12:00:00Z'
    };
    
    const result = FullBudgetSchema.safeParse(fullBudget);
    expect(result.success).toBe(true);
  });
});
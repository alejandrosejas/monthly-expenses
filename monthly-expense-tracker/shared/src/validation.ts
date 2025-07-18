import { z } from 'zod';

// Payment method enum
export const PaymentMethod = {
  CASH: 'cash',
  CREDIT: 'credit',
  DEBIT: 'debit',
  TRANSFER: 'transfer'
} as const;

export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];

// Expense validation schema
export const ExpenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  amount: z.number()
    .positive('Amount must be greater than 0')
    .max(999999.99, 'Amount must be less than 1,000,000')
    .transform(val => Number(val.toFixed(2))), // Ensure 2 decimal places
  category: z.string().min(1, 'Category is required').max(50, 'Category name is too long'),
  description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
  paymentMethod: z.enum([
    PaymentMethod.CASH, 
    PaymentMethod.CREDIT, 
    PaymentMethod.DEBIT, 
    PaymentMethod.TRANSFER
  ], {
    errorMap: () => ({ message: 'Invalid payment method' }),
  }),
});

export type ExpenseInput = z.infer<typeof ExpenseSchema>;

// Full expense schema including system-generated fields
export const FullExpenseSchema = ExpenseSchema.extend({
  id: z.string().uuid('ID must be a valid UUID'),
  createdAt: z.string().datetime('Created date must be a valid ISO datetime'),
  updatedAt: z.string().datetime('Updated date must be a valid ISO datetime'),
});

export type Expense = z.infer<typeof FullExpenseSchema>;

// Category validation schema
export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name is too long'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

// Full category schema including system-generated fields
export const FullCategorySchema = CategorySchema.extend({
  id: z.string().uuid('ID must be a valid UUID'),
  isDefault: z.boolean().default(false),
  createdAt: z.string().datetime('Created date must be a valid ISO datetime'),
});

export type Category = z.infer<typeof FullCategorySchema>;

// Budget validation schema
export const BudgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  totalBudget: z.number()
    .nonnegative('Budget cannot be negative')
    .max(9999999.99, 'Budget must be less than 10,000,000')
    .transform(val => Number(val.toFixed(2))), // Ensure 2 decimal places
  categoryBudgets: z.record(z.string(), z.number().nonnegative('Category budget cannot be negative')),
});

export type BudgetInput = z.infer<typeof BudgetSchema>;

// Full budget schema including system-generated fields
export const FullBudgetSchema = BudgetSchema.extend({
  id: z.string().uuid('ID must be a valid UUID'),
  createdAt: z.string().datetime('Created date must be a valid ISO datetime'),
  updatedAt: z.string().datetime('Updated date must be a valid ISO datetime'),
});

export type Budget = z.infer<typeof FullBudgetSchema>;

// API response schemas
export const ApiResponseSchema = <T extends z.ZodType>(schema: T) => 
  z.object({
    data: schema,
    message: z.string().optional(),
  });

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())).optional(),
  timestamp: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponseSchema = exports.ApiResponseSchema = exports.FullBudgetSchema = exports.BudgetSchema = exports.FullCategorySchema = exports.CategorySchema = exports.FullExpenseSchema = exports.ExpenseSchema = exports.PaymentMethod = void 0;
const zod_1 = require("zod");
// Payment method enum
exports.PaymentMethod = {
    CASH: 'cash',
    CREDIT: 'credit',
    DEBIT: 'debit',
    TRANSFER: 'transfer'
};
// Expense validation schema
exports.ExpenseSchema = zod_1.z.object({
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    amount: zod_1.z.number()
        .positive('Amount must be greater than 0')
        .max(999999.99, 'Amount must be less than 1,000,000')
        .transform(val => Number(val.toFixed(2))), // Ensure 2 decimal places
    category: zod_1.z.string().min(1, 'Category is required').max(50, 'Category name is too long'),
    description: zod_1.z.string().min(1, 'Description is required').max(200, 'Description is too long'),
    paymentMethod: zod_1.z.enum([
        exports.PaymentMethod.CASH,
        exports.PaymentMethod.CREDIT,
        exports.PaymentMethod.DEBIT,
        exports.PaymentMethod.TRANSFER
    ], {
        errorMap: () => ({ message: 'Invalid payment method' }),
    }),
});
// Full expense schema including system-generated fields
exports.FullExpenseSchema = exports.ExpenseSchema.extend({
    id: zod_1.z.string().uuid('ID must be a valid UUID'),
    createdAt: zod_1.z.string().datetime('Created date must be a valid ISO datetime'),
    updatedAt: zod_1.z.string().datetime('Updated date must be a valid ISO datetime'),
});
// Category validation schema
exports.CategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Category name is required').max(50, 'Category name is too long'),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'),
});
// Full category schema including system-generated fields
exports.FullCategorySchema = exports.CategorySchema.extend({
    id: zod_1.z.string().uuid('ID must be a valid UUID'),
    isDefault: zod_1.z.boolean().default(false),
    createdAt: zod_1.z.string().datetime('Created date must be a valid ISO datetime'),
});
// Budget validation schema
exports.BudgetSchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
    totalBudget: zod_1.z.number()
        .nonnegative('Budget cannot be negative')
        .max(9999999.99, 'Budget must be less than 10,000,000')
        .transform(val => Number(val.toFixed(2))), // Ensure 2 decimal places
    categoryBudgets: zod_1.z.record(zod_1.z.string(), zod_1.z.number().nonnegative('Category budget cannot be negative')),
});
// Full budget schema including system-generated fields
exports.FullBudgetSchema = exports.BudgetSchema.extend({
    id: zod_1.z.string().uuid('ID must be a valid UUID'),
    createdAt: zod_1.z.string().datetime('Created date must be a valid ISO datetime'),
    updatedAt: zod_1.z.string().datetime('Updated date must be a valid ISO datetime'),
});
// API response schemas
const ApiResponseSchema = (schema) => zod_1.z.object({
    data: schema,
    message: zod_1.z.string().optional(),
});
exports.ApiResponseSchema = ApiResponseSchema;
exports.ErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
    message: zod_1.z.string(),
    details: zod_1.z.record(zod_1.z.string(), zod_1.z.array(zod_1.z.string())).optional(),
    timestamp: zod_1.z.string(),
});

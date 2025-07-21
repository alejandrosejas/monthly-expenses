import { z } from 'zod';
export declare const PaymentMethod: {
    readonly CASH: "cash";
    readonly CREDIT: "credit";
    readonly DEBIT: "debit";
    readonly TRANSFER: "transfer";
};
export type PaymentMethodType = typeof PaymentMethod[keyof typeof PaymentMethod];
export declare const ExpenseSchema: z.ZodObject<{
    date: z.ZodString;
    amount: z.ZodEffects<z.ZodNumber, number, number>;
    category: z.ZodString;
    description: z.ZodString;
    paymentMethod: z.ZodEnum<["cash", "credit", "debit", "transfer"]>;
}, "strip", z.ZodTypeAny, {
    date: string;
    amount: number;
    category: string;
    description: string;
    paymentMethod: "cash" | "credit" | "debit" | "transfer";
}, {
    date: string;
    amount: number;
    category: string;
    description: string;
    paymentMethod: "cash" | "credit" | "debit" | "transfer";
}>;
export type ExpenseInput = z.infer<typeof ExpenseSchema>;
export declare const FullExpenseSchema: z.ZodObject<{
    date: z.ZodString;
    amount: z.ZodEffects<z.ZodNumber, number, number>;
    category: z.ZodString;
    description: z.ZodString;
    paymentMethod: z.ZodEnum<["cash", "credit", "debit", "transfer"]>;
} & {
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    date: string;
    amount: number;
    category: string;
    description: string;
    paymentMethod: "cash" | "credit" | "debit" | "transfer";
    id: string;
    createdAt: string;
    updatedAt: string;
}, {
    date: string;
    amount: number;
    category: string;
    description: string;
    paymentMethod: "cash" | "credit" | "debit" | "transfer";
    id: string;
    createdAt: string;
    updatedAt: string;
}>;
export type Expense = z.infer<typeof FullExpenseSchema>;
export declare const CategorySchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    color: string;
}, {
    name: string;
    color: string;
}>;
export type CategoryInput = z.infer<typeof CategorySchema>;
export declare const FullCategorySchema: z.ZodObject<{
    name: z.ZodString;
    color: z.ZodString;
} & {
    id: z.ZodString;
    isDefault: z.ZodDefault<z.ZodBoolean>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    name: string;
    color: string;
    isDefault: boolean;
}, {
    id: string;
    createdAt: string;
    name: string;
    color: string;
    isDefault?: boolean | undefined;
}>;
export type Category = z.infer<typeof FullCategorySchema>;
export declare const BudgetSchema: z.ZodObject<{
    month: z.ZodString;
    totalBudget: z.ZodEffects<z.ZodNumber, number, number>;
    categoryBudgets: z.ZodRecord<z.ZodString, z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    month: string;
    totalBudget: number;
    categoryBudgets: Record<string, number>;
}, {
    month: string;
    totalBudget: number;
    categoryBudgets: Record<string, number>;
}>;
export type BudgetInput = z.infer<typeof BudgetSchema>;
export declare const FullBudgetSchema: z.ZodObject<{
    month: z.ZodString;
    totalBudget: z.ZodEffects<z.ZodNumber, number, number>;
    categoryBudgets: z.ZodRecord<z.ZodString, z.ZodNumber>;
} & {
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    month: string;
    totalBudget: number;
    categoryBudgets: Record<string, number>;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    month: string;
    totalBudget: number;
    categoryBudgets: Record<string, number>;
}>;
export type Budget = z.infer<typeof FullBudgetSchema>;
export declare const ApiResponseSchema: <T extends z.ZodType>(schema: T) => z.ZodObject<{
    data: T;
    message: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    data: T;
    message: z.ZodOptional<z.ZodString>;
}>, any> extends infer T_1 ? { [k in keyof T_1]: z.objectUtil.addQuestionMarks<z.baseObjectOutputType<{
    data: T;
    message: z.ZodOptional<z.ZodString>;
}>, any>[k]; } : never, z.baseObjectInputType<{
    data: T;
    message: z.ZodOptional<z.ZodString>;
}> extends infer T_2 ? { [k_1 in keyof T_2]: z.baseObjectInputType<{
    data: T;
    message: z.ZodOptional<z.ZodString>;
}>[k_1]; } : never>;
export declare const ErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodArray<z.ZodString, "many">>>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    error: string;
    timestamp: string;
    details?: Record<string, string[]> | undefined;
}, {
    message: string;
    error: string;
    timestamp: string;
    details?: Record<string, string[]> | undefined;
}>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

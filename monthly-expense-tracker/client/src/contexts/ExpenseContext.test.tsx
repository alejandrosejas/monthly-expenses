import React from 'react';
import { render, renderHook, act, waitFor } from '@testing-library/react';
import { ExpenseProvider, useExpenseContext } from './ExpenseContext';
import { ToastProvider } from '../components/common/Toast';
import api from '../services/api';
import { Expense, Category, Budget, ExpenseInput, CategoryInput, BudgetInput } from 'shared';

import { describe, vi } from 'vitest';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';
import { it } from 'date-fns/locale';

// Mock the API
vi.mock('../services/api');
const mockApi = api as any;

// Mock toast
vi.mock('../components/common/Toast', () => ({
    ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useToast: () => ({
        addToast: vi.fn(),
    }),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ToastProvider>
        <ExpenseProvider>
            {children}
        </ExpenseProvider>
    </ToastProvider>
);

// Mock data
const mockExpense: Expense = {
    id: '1',
    date: '2024-01-15',
    amount: 50.00,
    category: 'food',
    description: 'Lunch',
    paymentMethod: 'credit',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
};

const mockCategory: Category = {
    id: 'food',
    name: 'Food',
    color: '#FF6B6B',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
};

const mockBudget: Budget = {
    id: '1',
    month: '2024-01',
    totalBudget: 1000,
    categoryBudgets: { food: 300 },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
};

describe('ExpenseContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchExpenses', () => {
        it('should fetch expenses successfully', async () => {
            mockApi.get.mockResolvedValueOnce({ data: [mockExpense] });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            await act(async () => {
                await result.current.fetchExpenses('2024-01');
            });

            expect(mockApi.get).toHaveBeenCalledWith('/expenses', { month: '2024-01' });
            expect(result.current.getExpensesForMonth('2024-01')).toEqual([mockExpense]);
        });

        it('should handle fetch expenses error', async () => {
            const error = new Error('Network error');
            mockApi.get.mockRejectedValueOnce(error);

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            await act(async () => {
                await result.current.fetchExpenses('2024-01');
            });

            expect(result.current.state.errors.expenses).toBe('Network error');
        });

        it('should use cached data when not stale', async () => {
            mockApi.get.mockResolvedValueOnce({ data: [mockExpense] });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            // First fetch
            await act(async () => {
                await result.current.fetchExpenses('2024-01');
            });

            // Second fetch should use cache
            await act(async () => {
                await result.current.fetchExpenses('2024-01');
            });

            expect(mockApi.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('createExpense', () => {
        it('should create expense with optimistic update', async () => {
            const expenseInput: ExpenseInput = {
                date: '2024-01-15',
                amount: 50.00,
                category: 'food',
                description: 'Lunch',
                paymentMethod: 'credit',
            };

            mockApi.post.mockResolvedValueOnce({ data: mockExpense });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            let createdExpense: Expense | null = null;

            await act(async () => {
                createdExpense = await result.current.createExpense('2024-01', expenseInput);
            });

            expect(mockApi.post).toHaveBeenCalledWith('/expenses', expenseInput);
            expect(createdExpense).toEqual(mockExpense);
            expect(result.current.getExpensesForMonth('2024-01')).toContain(mockExpense);
        });

        it('should revert optimistic update on error', async () => {
            const expenseInput: ExpenseInput = {
                date: '2024-01-15',
                amount: 50.00,
                category: 'food',
                description: 'Lunch',
                paymentMethod: 'credit',
            };

            const error = new Error('Server error');
            mockApi.post.mockRejectedValueOnce(error);

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            await act(async () => {
                await result.current.createExpense('2024-01', expenseInput);
            });

            expect(result.current.getExpensesForMonth('2024-01')).toEqual([]);
        });
    });

    describe('updateExpense', () => {
        it('should update expense with optimistic update', async () => {
            const updatedExpense = { ...mockExpense, description: 'Updated lunch' };
            const expenseInput: ExpenseInput = {
                date: '2024-01-15',
                amount: 50.00,
                category: 'food',
                description: 'Updated lunch',
                paymentMethod: 'credit',
            };

            // Set initial state
            mockApi.get.mockResolvedValueOnce({ data: [mockExpense] });
            mockApi.put.mockResolvedValueOnce({ data: updatedExpense });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            // Fetch initial data
            await act(async () => {
                await result.current.fetchExpenses('2024-01');
            });

            // Update expense
            await act(async () => {
                await result.current.updateExpense('2024-01', mockExpense.id, expenseInput);
            });

            expect(mockApi.put).toHaveBeenCalledWith(`/expenses/${mockExpense.id}`, expenseInput);
            expect(result.current.getExpensesForMonth('2024-01')[0].description).toBe('Updated lunch');
        });
    });

    describe('deleteExpense', () => {
        it('should delete expense with optimistic update', async () => {
            // Set initial state
            mockApi.get.mockResolvedValueOnce({ data: [mockExpense] });
            mockApi.delete.mockResolvedValueOnce({});

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            // Fetch initial data
            await act(async () => {
                await result.current.fetchExpenses('2024-01');
            });

            // Delete expense
            let deleteResult: boolean = false;
            await act(async () => {
                deleteResult = await result.current.deleteExpense('2024-01', mockExpense.id);
            });

            expect(mockApi.delete).toHaveBeenCalledWith(`/expenses/${mockExpense.id}`);
            expect(deleteResult).toBe(true);
            expect(result.current.getExpensesForMonth('2024-01')).toEqual([]);
        });
    });

    describe('fetchCategories', () => {
        it('should fetch categories successfully', async () => {
            mockApi.get.mockResolvedValueOnce({ data: [mockCategory] });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            await act(async () => {
                await result.current.fetchCategories();
            });

            expect(mockApi.get).toHaveBeenCalledWith('/categories');
            expect(result.current.state.categories).toEqual([mockCategory]);
        });
    });

    describe('createCategory', () => {
        it('should create category with optimistic update', async () => {
            const categoryInput: CategoryInput = {
                name: 'Food',
                color: '#FF6B6B',
            };

            mockApi.post.mockResolvedValueOnce({ data: mockCategory });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            let createdCategory: Category | null = null;

            await act(async () => {
                createdCategory = await result.current.createCategory(categoryInput);
            });

            expect(mockApi.post).toHaveBeenCalledWith('/categories', categoryInput);
            expect(createdCategory).toEqual(mockCategory);
            expect(result.current.state.categories).toContain(mockCategory);
        });
    });

    describe('updateCategory', () => {
        it('should update category with optimistic update', async () => {
            const updatedCategory = { ...mockCategory, name: 'Updated Food' };
            const categoryInput: CategoryInput = {
                name: 'Updated Food',
                color: '#FF6B6B',
            };

            // Set initial state
            mockApi.get.mockResolvedValueOnce({ data: [mockCategory] });
            mockApi.put.mockResolvedValueOnce({ data: updatedCategory });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            // Fetch initial data
            await act(async () => {
                await result.current.fetchCategories();
            });

            // Update category
            await act(async () => {
                await result.current.updateCategory(mockCategory.id, categoryInput);
            });

            expect(mockApi.put).toHaveBeenCalledWith(`/categories/${mockCategory.id}`, categoryInput);
            expect(result.current.state.categories[0].name).toBe('Updated Food');
        });
    });

    describe('deleteCategory', () => {
        it('should delete category with optimistic update', async () => {
            // Set initial state
            mockApi.get.mockResolvedValueOnce({ data: [mockCategory] });
            mockApi.delete.mockResolvedValueOnce({});

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            // Fetch initial data
            await act(async () => {
                await result.current.fetchCategories();
            });

            // Delete category
            let deleteResult: boolean = false;
            await act(async () => {
                deleteResult = await result.current.deleteCategory(mockCategory.id);
            });

            expect(mockApi.delete).toHaveBeenCalledWith(`/categories/${mockCategory.id}`);
            expect(deleteResult).toBe(true);
            expect(result.current.state.categories).toEqual([]);
        });
    });

    describe('fetchBudget', () => {
        it('should fetch budget successfully', async () => {
            mockApi.get.mockResolvedValueOnce({ data: mockBudget });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            await act(async () => {
                await result.current.fetchBudget('2024-01');
            });

            expect(mockApi.get).toHaveBeenCalledWith('/budgets/2024-01');
            expect(result.current.getBudgetForMonth('2024-01')).toEqual(mockBudget);
        });
    });

    describe('updateBudget', () => {
        it('should update budget with optimistic update', async () => {
            const budgetInput: BudgetInput = {
                totalBudget: 1200,
                categoryBudgets: { food: 400 },
            };

            const updatedBudget = { ...mockBudget, ...budgetInput };
            mockApi.post.mockResolvedValueOnce({ data: updatedBudget });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            let updatedResult: Budget | null = null;

            await act(async () => {
                updatedResult = await result.current.updateBudget('2024-01', budgetInput);
            });

            expect(mockApi.post).toHaveBeenCalledWith('/budgets', { month: '2024-01', ...budgetInput });
            expect(updatedResult).toEqual(updatedBudget);
            expect(result.current.getBudgetForMonth('2024-01')).toEqual(updatedBudget);
        });
    });

    describe('utility functions', () => {
        it('should get category by id', async () => {
            mockApi.get.mockResolvedValueOnce({ data: [mockCategory] });

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            await act(async () => {
                await result.current.fetchCategories();
            });

            expect(result.current.getCategoryById('food')).toEqual(mockCategory);
            expect(result.current.getCategoryById('nonexistent')).toBeUndefined();
        });

        it('should invalidate cache', () => {
            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            act(() => {
                result.current.invalidateCache('expenses', '2024-01');
                result.current.invalidateCache('categories');
                result.current.invalidateCache('budgets', '2024-01');
            });

            // Cache invalidation should work without errors
            expect(result.current.state).toBeDefined();
        });
    });

    describe('loading states', () => {
        it('should set loading state during fetch operations', async () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise(resolve => {
                resolvePromise = resolve;
            });
            mockApi.get.mockReturnValueOnce(promise);

            const { result } = renderHook(() => useExpenseContext(), {
                wrapper: TestWrapper,
            });

            // Start fetch
            act(() => {
                result.current.fetchExpenses('2024-01');
            });

            // Should be loading
            expect(result.current.state.loading.expenses).toBe(true);

            // Resolve promise
            await act(async () => {
                resolvePromise!({ data: [mockExpense] });
                await promise;
            });

            // Should not be loading
            expect(result.current.state.loading.expenses).toBe(false);
        });
    });
});
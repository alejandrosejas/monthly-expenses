import { useCallback, useEffect, useMemo } from 'react';
import { useExpenseContext } from '../contexts/ExpenseContext';
import { Expense, Category, Budget, ExpenseInput, CategoryInput, BudgetInput } from 'shared';

interface UseExpenseStateOptions {
  month?: string;
  autoFetch?: boolean;
  refreshInterval?: number;
}

interface UseExpenseStateReturn {
  // Data
  expenses: Expense[];
  categories: Category[];
  budget: Budget | undefined;
  
  // Loading states
  loading: {
    expenses: boolean;
    categories: boolean;
    budgets: boolean;
  };
  
  // Error states
  errors: {
    expenses: string | null;
    categories: string | null;
    budgets: string | null;
  };
  
  // Expense operations
  addExpense: (expense: ExpenseInput) => Promise<Expense | null>;
  updateExpense: (expenseId: string, expense: ExpenseInput) => Promise<Expense | null>;
  deleteExpense: (expenseId: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
  
  // Category operations
  addCategory: (category: CategoryInput) => Promise<Category | null>;
  updateCategory: (categoryId: string, category: CategoryInput) => Promise<Category | null>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  refreshCategories: () => Promise<void>;
  
  // Budget operations
  updateBudget: (budget: BudgetInput) => Promise<Budget | null>;
  refreshBudget: () => Promise<void>;
  
  // Utility functions
  getCategoryById: (categoryId: string) => Category | undefined;
  getExpensesByCategory: (categoryId: string) => Expense[];
  getTotalExpenses: () => number;
  getCategoryTotals: () => Record<string, number>;
  getBudgetStatus: () => {
    totalBudget: number;
    totalSpent: number;
    remaining: number;
    percentUsed: number;
    isOverBudget: boolean;
    categoryStatus: Record<string, {
      budget: number;
      spent: number;
      remaining: number;
      percentUsed: number;
      isOverBudget: boolean;
    }>;
  };
  
  // Cache management
  invalidateCache: () => void;
}

export const useExpenseState = (options: UseExpenseStateOptions = {}): UseExpenseStateReturn => {
  const {
    month,
    autoFetch = true,
    refreshInterval,
  } = options;

  const {
    state,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchBudget,
    updateBudget,
    getExpensesForMonth,
    getCategoryById,
    getBudgetForMonth,
    invalidateCache: contextInvalidateCache,
  } = useExpenseContext();

  // Get current month data
  const currentMonth = month || new Date().toISOString().slice(0, 7); // YYYY-MM format
  const expenses = useMemo(() => getExpensesForMonth(currentMonth), [getExpensesForMonth, currentMonth]);
  const budget = useMemo(() => getBudgetForMonth(currentMonth), [getBudgetForMonth, currentMonth]);

  // Auto-fetch data on mount and when month changes
  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
      if (currentMonth) {
        fetchExpenses(currentMonth);
        fetchBudget(currentMonth);
      }
    }
  }, [autoFetch, currentMonth, fetchCategories, fetchExpenses, fetchBudget]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(() => {
        fetchCategories(true);
        if (currentMonth) {
          fetchExpenses(currentMonth, true);
          fetchBudget(currentMonth, true);
        }
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, currentMonth, fetchCategories, fetchExpenses, fetchBudget]);

  // Expense operations with month context
  const addExpense = useCallback(async (expense: ExpenseInput): Promise<Expense | null> => {
    return createExpense(currentMonth, expense);
  }, [createExpense, currentMonth]);

  const updateExpenseWithMonth = useCallback(async (expenseId: string, expense: ExpenseInput): Promise<Expense | null> => {
    return updateExpense(currentMonth, expenseId, expense);
  }, [updateExpense, currentMonth]);

  const deleteExpenseWithMonth = useCallback(async (expenseId: string): Promise<boolean> => {
    return deleteExpense(currentMonth, expenseId);
  }, [deleteExpense, currentMonth]);

  const refreshExpenses = useCallback(async (): Promise<void> => {
    await fetchExpenses(currentMonth, true);
  }, [fetchExpenses, currentMonth]);

  // Category operations
  const addCategory = useCallback(async (category: CategoryInput): Promise<Category | null> => {
    return createCategory(category);
  }, [createCategory]);

  const updateCategoryWithId = useCallback(async (categoryId: string, category: CategoryInput): Promise<Category | null> => {
    return updateCategory(categoryId, category);
  }, [updateCategory]);

  const deleteCategoryWithId = useCallback(async (categoryId: string): Promise<boolean> => {
    return deleteCategory(categoryId);
  }, [deleteCategory]);

  const refreshCategories = useCallback(async (): Promise<void> => {
    await fetchCategories(true);
  }, [fetchCategories]);

  // Budget operations with month context
  const updateBudgetWithMonth = useCallback(async (budgetData: BudgetInput): Promise<Budget | null> => {
    return updateBudget(currentMonth, budgetData);
  }, [updateBudget, currentMonth]);

  const refreshBudget = useCallback(async (): Promise<void> => {
    await fetchBudget(currentMonth, true);
  }, [fetchBudget, currentMonth]);

  // Utility functions
  const getExpensesByCategory = useCallback((categoryId: string): Expense[] => {
    return expenses.filter(expense => expense.category === categoryId);
  }, [expenses]);

  const getTotalExpenses = useCallback((): number => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }, [expenses]);

  const getCategoryTotals = useCallback((): Record<string, number> => {
    const totals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      totals[expense.category] += expense.amount;
    });
    
    return totals;
  }, [expenses]);

  const getBudgetStatus = useCallback(() => {
    const totalBudget = budget?.totalBudget || 0;
    const totalSpent = getTotalExpenses();
    const remaining = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const isOverBudget = totalSpent > totalBudget;

    const categoryTotals = getCategoryTotals();
    const categoryStatus: Record<string, {
      budget: number;
      spent: number;
      remaining: number;
      percentUsed: number;
      isOverBudget: boolean;
    }> = {};

    // Calculate category budget status
    if (budget?.categoryBudgets) {
      Object.entries(budget.categoryBudgets).forEach(([categoryId, categoryBudget]) => {
        const spent = categoryTotals[categoryId] || 0;
        const remaining = categoryBudget - spent;
        const percentUsed = categoryBudget > 0 ? (spent / categoryBudget) * 100 : 0;
        const isOverBudget = spent > categoryBudget;

        categoryStatus[categoryId] = {
          budget: categoryBudget,
          spent,
          remaining,
          percentUsed,
          isOverBudget,
        };
      });
    }

    return {
      totalBudget,
      totalSpent,
      remaining,
      percentUsed,
      isOverBudget,
      categoryStatus,
    };
  }, [budget, getTotalExpenses, getCategoryTotals]);

  // Cache management
  const invalidateCache = useCallback(() => {
    contextInvalidateCache('expenses', currentMonth);
    contextInvalidateCache('categories');
    contextInvalidateCache('budgets', currentMonth);
  }, [contextInvalidateCache, currentMonth]);

  return {
    // Data
    expenses,
    categories: state.categories,
    budget,
    
    // Loading states
    loading: state.loading,
    
    // Error states
    errors: state.errors,
    
    // Expense operations
    addExpense,
    updateExpense: updateExpenseWithMonth,
    deleteExpense: deleteExpenseWithMonth,
    refreshExpenses,
    
    // Category operations
    addCategory,
    updateCategory: updateCategoryWithId,
    deleteCategory: deleteCategoryWithId,
    refreshCategories,
    
    // Budget operations
    updateBudget: updateBudgetWithMonth,
    refreshBudget,
    
    // Utility functions
    getCategoryById,
    getExpensesByCategory,
    getTotalExpenses,
    getCategoryTotals,
    getBudgetStatus,
    
    // Cache management
    invalidateCache,
  };
};

export default useExpenseState;
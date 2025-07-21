import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Expense, Category, Budget, ExpenseInput, CategoryInput, BudgetInput } from 'shared';
import api from '../services/api';
import { useToast } from '../components/common/Toast';

// State interface
interface ExpenseState {
  expenses: Record<string, Expense[]>; // Keyed by month (YYYY-MM)
  categories: Category[];
  budgets: Record<string, Budget>; // Keyed by month (YYYY-MM)
  loading: {
    expenses: boolean;
    categories: boolean;
    budgets: boolean;
  };
  errors: {
    expenses: string | null;
    categories: string | null;
    budgets: string | null;
  };
  lastUpdated: {
    expenses: Record<string, number>; // Keyed by month
    categories: number;
    budgets: Record<string, number>; // Keyed by month
  };
}

// Action types
type ExpenseAction =
  // Loading actions
  | { type: 'SET_LOADING'; payload: { key: keyof ExpenseState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof ExpenseState['errors']; error: string | null } }
  
  // Expense actions
  | { type: 'SET_EXPENSES'; payload: { month: string; expenses: Expense[] } }
  | { type: 'ADD_EXPENSE_OPTIMISTIC'; payload: { month: string; expense: Expense } }
  | { type: 'UPDATE_EXPENSE_OPTIMISTIC'; payload: { month: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE_OPTIMISTIC'; payload: { month: string; expenseId: string } }
  | { type: 'REVERT_EXPENSE_OPTIMISTIC'; payload: { month: string; expenses: Expense[] } }
  
  // Category actions
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY_OPTIMISTIC'; payload: Category }
  | { type: 'UPDATE_CATEGORY_OPTIMISTIC'; payload: Category }
  | { type: 'DELETE_CATEGORY_OPTIMISTIC'; payload: string }
  | { type: 'REVERT_CATEGORIES_OPTIMISTIC'; payload: Category[] }
  
  // Budget actions
  | { type: 'SET_BUDGET'; payload: { month: string; budget: Budget } }
  | { type: 'UPDATE_BUDGET_OPTIMISTIC'; payload: { month: string; budget: Budget } }
  | { type: 'REVERT_BUDGET_OPTIMISTIC'; payload: { month: string; budget: Budget } }
  
  // Cache management
  | { type: 'UPDATE_LAST_UPDATED'; payload: { key: string; timestamp: number } };

// Initial state
const initialState: ExpenseState = {
  expenses: {},
  categories: [],
  budgets: {},
  loading: {
    expenses: false,
    categories: false,
    budgets: false,
  },
  errors: {
    expenses: null,
    categories: null,
    budgets: null,
  },
  lastUpdated: {
    expenses: {},
    categories: 0,
    budgets: {},
  },
};

// Reducer
function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.key]: action.payload.error,
        },
      };
      
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.payload.month]: action.payload.expenses,
        },
        lastUpdated: {
          ...state.lastUpdated,
          expenses: {
            ...state.lastUpdated.expenses,
            [action.payload.month]: Date.now(),
          },
        },
      };
      
    case 'ADD_EXPENSE_OPTIMISTIC':
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.payload.month]: [
            action.payload.expense,
            ...(state.expenses[action.payload.month] || []),
          ],
        },
      };
      
    case 'UPDATE_EXPENSE_OPTIMISTIC':
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.payload.month]: (state.expenses[action.payload.month] || []).map(expense =>
            expense.id === action.payload.expense.id ? action.payload.expense : expense
          ),
        },
      };
      
    case 'DELETE_EXPENSE_OPTIMISTIC':
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.payload.month]: (state.expenses[action.payload.month] || []).filter(
            expense => expense.id !== action.payload.expenseId
          ),
        },
      };
      
    case 'REVERT_EXPENSE_OPTIMISTIC':
      return {
        ...state,
        expenses: {
          ...state.expenses,
          [action.payload.month]: action.payload.expenses,
        },
      };
      
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          categories: Date.now(),
        },
      };
      
    case 'ADD_CATEGORY_OPTIMISTIC':
      return {
        ...state,
        categories: [...state.categories, action.payload],
      };
      
    case 'UPDATE_CATEGORY_OPTIMISTIC':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        ),
      };
      
    case 'DELETE_CATEGORY_OPTIMISTIC':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
      };
      
    case 'REVERT_CATEGORIES_OPTIMISTIC':
      return {
        ...state,
        categories: action.payload,
      };
      
    case 'SET_BUDGET':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.month]: action.payload.budget,
        },
        lastUpdated: {
          ...state.lastUpdated,
          budgets: {
            ...state.lastUpdated.budgets,
            [action.payload.month]: Date.now(),
          },
        },
      };
      
    case 'UPDATE_BUDGET_OPTIMISTIC':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.month]: action.payload.budget,
        },
      };
      
    case 'REVERT_BUDGET_OPTIMISTIC':
      return {
        ...state,
        budgets: {
          ...state.budgets,
          [action.payload.month]: action.payload.budget,
        },
      };
      
    case 'UPDATE_LAST_UPDATED':
      return {
        ...state,
        lastUpdated: {
          ...state.lastUpdated,
          [action.payload.key]: action.payload.timestamp,
        },
      };
      
    default:
      return state;
  }
}

// Context interface
interface ExpenseContextValue {
  state: ExpenseState;
  
  // Expense operations
  fetchExpenses: (month: string, force?: boolean) => Promise<void>;
  createExpense: (month: string, expense: ExpenseInput) => Promise<Expense | null>;
  updateExpense: (month: string, expenseId: string, expense: ExpenseInput) => Promise<Expense | null>;
  deleteExpense: (month: string, expenseId: string) => Promise<boolean>;
  
  // Category operations
  fetchCategories: (force?: boolean) => Promise<void>;
  createCategory: (category: CategoryInput) => Promise<Category | null>;
  updateCategory: (categoryId: string, category: CategoryInput) => Promise<Category | null>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  
  // Budget operations
  fetchBudget: (month: string, force?: boolean) => Promise<void>;
  updateBudget: (month: string, budget: BudgetInput) => Promise<Budget | null>;
  
  // Utility functions
  getExpensesForMonth: (month: string) => Expense[];
  getCategoryById: (categoryId: string) => Category | undefined;
  getBudgetForMonth: (month: string) => Budget | undefined;
  invalidateCache: (type: 'expenses' | 'categories' | 'budgets', key?: string) => void;
}

// Create context
const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

// Cache duration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// Provider component
export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { addToast } = useToast();

  // Helper function to check if data is stale
  const isStale = useCallback((timestamp: number) => {
    return Date.now() - timestamp > CACHE_DURATION;
  }, []);

  // Expense operations
  const fetchExpenses = useCallback(async (month: string, force = false) => {
    const lastUpdated = state.lastUpdated.expenses[month] || 0;
    
    if (!force && state.expenses[month] && !isStale(lastUpdated)) {
      return; // Use cached data
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'expenses', loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'expenses', error: null } });

    try {
      const response = await api.get<{ data: Expense[] }>('/expenses', { month });
      dispatch({ type: 'SET_EXPENSES', payload: { month, expenses: response.data } });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch expenses';
      dispatch({ type: 'SET_ERROR', payload: { key: 'expenses', error: errorMessage } });
      addToast(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'expenses', loading: false } });
    }
  }, [state.lastUpdated.expenses, state.expenses, isStale, addToast]);

  const createExpense = useCallback(async (month: string, expenseData: ExpenseInput): Promise<Expense | null> => {
    // Create optimistic expense
    const optimisticExpense: Expense = {
      id: `temp-${Date.now()}`,
      ...expenseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Apply optimistic update
    dispatch({ type: 'ADD_EXPENSE_OPTIMISTIC', payload: { month, expense: optimisticExpense } });

    try {
      const response = await api.post<{ data: Expense }>('/expenses', expenseData);
      const newExpense = response.data;

      // Replace optimistic expense with real one
      const currentExpenses = state.expenses[month] || [];
      const updatedExpenses = currentExpenses.map(expense =>
        expense.id === optimisticExpense.id ? newExpense : expense
      );
      
      dispatch({ type: 'SET_EXPENSES', payload: { month, expenses: updatedExpenses } });
      addToast('Expense added successfully', 'success');
      
      return newExpense;
    } catch (error: any) {
      // Revert optimistic update
      const originalExpenses = (state.expenses[month] || []).filter(
        expense => expense.id !== optimisticExpense.id
      );
      dispatch({ type: 'REVERT_EXPENSE_OPTIMISTIC', payload: { month, expenses: originalExpenses } });
      
      const errorMessage = error.message || 'Failed to create expense';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [state.expenses, addToast]);

  const updateExpense = useCallback(async (month: string, expenseId: string, expenseData: ExpenseInput): Promise<Expense | null> => {
    const originalExpenses = state.expenses[month] || [];
    const originalExpense = originalExpenses.find(e => e.id === expenseId);
    
    if (!originalExpense) {
      addToast('Expense not found', 'error');
      return null;
    }

    // Create optimistic update
    const optimisticExpense: Expense = {
      ...originalExpense,
      ...expenseData,
      updatedAt: new Date().toISOString(),
    };

    // Apply optimistic update
    dispatch({ type: 'UPDATE_EXPENSE_OPTIMISTIC', payload: { month, expense: optimisticExpense } });

    try {
      const response = await api.put<{ data: Expense }>(`/expenses/${expenseId}`, expenseData);
      const updatedExpense = response.data;

      // Update with real data
      dispatch({ type: 'UPDATE_EXPENSE_OPTIMISTIC', payload: { month, expense: updatedExpense } });
      addToast('Expense updated successfully', 'success');
      
      return updatedExpense;
    } catch (error: any) {
      // Revert optimistic update
      dispatch({ type: 'REVERT_EXPENSE_OPTIMISTIC', payload: { month, expenses: originalExpenses } });
      
      const errorMessage = error.message || 'Failed to update expense';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [state.expenses, addToast]);

  const deleteExpense = useCallback(async (month: string, expenseId: string): Promise<boolean> => {
    const originalExpenses = state.expenses[month] || [];
    const expenseToDelete = originalExpenses.find(e => e.id === expenseId);
    
    if (!expenseToDelete) {
      addToast('Expense not found', 'error');
      return false;
    }

    // Apply optimistic delete
    dispatch({ type: 'DELETE_EXPENSE_OPTIMISTIC', payload: { month, expenseId } });

    try {
      await api.delete(`/expenses/${expenseId}`);
      addToast('Expense deleted successfully', 'success');
      return true;
    } catch (error: any) {
      // Revert optimistic delete
      dispatch({ type: 'REVERT_EXPENSE_OPTIMISTIC', payload: { month, expenses: originalExpenses } });
      
      const errorMessage = error.message || 'Failed to delete expense';
      addToast(errorMessage, 'error');
      return false;
    }
  }, [state.expenses, addToast]);

  // Category operations
  const fetchCategories = useCallback(async (force = false) => {
    if (!force && state.categories.length > 0 && !isStale(state.lastUpdated.categories)) {
      return; // Use cached data
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'categories', loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'categories', error: null } });

    try {
      const response = await api.get<{ data: Category[] }>('/categories');
      dispatch({ type: 'SET_CATEGORIES', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch categories';
      dispatch({ type: 'SET_ERROR', payload: { key: 'categories', error: errorMessage } });
      addToast(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'categories', loading: false } });
    }
  }, [state.categories.length, state.lastUpdated.categories, isStale, addToast]);

  const createCategory = useCallback(async (categoryData: CategoryInput): Promise<Category | null> => {
    // Create optimistic category
    const optimisticCategory: Category = {
      id: `temp-${Date.now()}`,
      ...categoryData,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };

    // Apply optimistic update
    dispatch({ type: 'ADD_CATEGORY_OPTIMISTIC', payload: optimisticCategory });

    try {
      const response = await api.post<{ data: Category }>('/categories', categoryData);
      const newCategory = response.data;

      // Replace optimistic category with real one
      const updatedCategories = state.categories.map(category =>
        category.id === optimisticCategory.id ? newCategory : category
      );
      
      dispatch({ type: 'SET_CATEGORIES', payload: updatedCategories });
      addToast('Category created successfully', 'success');
      
      return newCategory;
    } catch (error: any) {
      // Revert optimistic update
      const originalCategories = state.categories.filter(
        category => category.id !== optimisticCategory.id
      );
      dispatch({ type: 'REVERT_CATEGORIES_OPTIMISTIC', payload: originalCategories });
      
      const errorMessage = error.message || 'Failed to create category';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [state.categories, addToast]);

  const updateCategory = useCallback(async (categoryId: string, categoryData: CategoryInput): Promise<Category | null> => {
    const originalCategories = state.categories;
    const originalCategory = originalCategories.find(c => c.id === categoryId);
    
    if (!originalCategory) {
      addToast('Category not found', 'error');
      return null;
    }

    // Create optimistic update
    const optimisticCategory: Category = {
      ...originalCategory,
      ...categoryData,
    };

    // Apply optimistic update
    dispatch({ type: 'UPDATE_CATEGORY_OPTIMISTIC', payload: optimisticCategory });

    try {
      const response = await api.put<{ data: Category }>(`/categories/${categoryId}`, categoryData);
      const updatedCategory = response.data;

      // Update with real data
      dispatch({ type: 'UPDATE_CATEGORY_OPTIMISTIC', payload: updatedCategory });
      addToast('Category updated successfully', 'success');
      
      return updatedCategory;
    } catch (error: any) {
      // Revert optimistic update
      dispatch({ type: 'REVERT_CATEGORIES_OPTIMISTIC', payload: originalCategories });
      
      const errorMessage = error.message || 'Failed to update category';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [state.categories, addToast]);

  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    const originalCategories = state.categories;
    const categoryToDelete = originalCategories.find(c => c.id === categoryId);
    
    if (!categoryToDelete) {
      addToast('Category not found', 'error');
      return false;
    }

    // Apply optimistic delete
    dispatch({ type: 'DELETE_CATEGORY_OPTIMISTIC', payload: categoryId });

    try {
      await api.delete(`/categories/${categoryId}`);
      addToast('Category deleted successfully', 'success');
      return true;
    } catch (error: any) {
      // Revert optimistic delete
      dispatch({ type: 'REVERT_CATEGORIES_OPTIMISTIC', payload: originalCategories });
      
      const errorMessage = error.message || 'Failed to delete category';
      addToast(errorMessage, 'error');
      return false;
    }
  }, [state.categories, addToast]);

  // Budget operations
  const fetchBudget = useCallback(async (month: string, force = false) => {
    const lastUpdated = state.lastUpdated.budgets[month] || 0;
    
    if (!force && state.budgets[month] && !isStale(lastUpdated)) {
      return; // Use cached data
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'budgets', loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', error: null } });

    try {
      const response = await api.get<{ data: Budget }>(`/budgets/${month}`);
      dispatch({ type: 'SET_BUDGET', payload: { month, budget: response.data } });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch budget';
      dispatch({ type: 'SET_ERROR', payload: { key: 'budgets', error: errorMessage } });
      addToast(errorMessage, 'error');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'budgets', loading: false } });
    }
  }, [state.lastUpdated.budgets, state.budgets, isStale, addToast]);

  const updateBudget = useCallback(async (month: string, budgetData: BudgetInput): Promise<Budget | null> => {
    const originalBudget = state.budgets[month];

    // Create optimistic update
    const optimisticBudget: Budget = {
      id: originalBudget?.id || `temp-${Date.now()}`,
      month,
      ...budgetData,
      createdAt: originalBudget?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Apply optimistic update
    dispatch({ type: 'UPDATE_BUDGET_OPTIMISTIC', payload: { month, budget: optimisticBudget } });

    try {
      const response = await api.post<{ data: Budget }>('/budgets', { month, ...budgetData });
      const updatedBudget = response.data;

      // Update with real data
      dispatch({ type: 'SET_BUDGET', payload: { month, budget: updatedBudget } });
      addToast('Budget updated successfully', 'success');
      
      return updatedBudget;
    } catch (error: any) {
      // Revert optimistic update
      if (originalBudget) {
        dispatch({ type: 'REVERT_BUDGET_OPTIMISTIC', payload: { month, budget: originalBudget } });
      }
      
      const errorMessage = error.message || 'Failed to update budget';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [state.budgets, addToast]);

  // Utility functions
  const getExpensesForMonth = useCallback((month: string): Expense[] => {
    return state.expenses[month] || [];
  }, [state.expenses]);

  const getCategoryById = useCallback((categoryId: string): Category | undefined => {
    return state.categories.find(category => category.id === categoryId);
  }, [state.categories]);

  const getBudgetForMonth = useCallback((month: string): Budget | undefined => {
    return state.budgets[month];
  }, [state.budgets]);

  const invalidateCache = useCallback((type: 'expenses' | 'categories' | 'budgets', key?: string) => {
    if (type === 'expenses' && key) {
      dispatch({ type: 'UPDATE_LAST_UPDATED', payload: { key: `expenses.${key}`, timestamp: 0 } });
    } else if (type === 'categories') {
      dispatch({ type: 'UPDATE_LAST_UPDATED', payload: { key: 'categories', timestamp: 0 } });
    } else if (type === 'budgets' && key) {
      dispatch({ type: 'UPDATE_LAST_UPDATED', payload: { key: `budgets.${key}`, timestamp: 0 } });
    }
  }, []);

  const contextValue: ExpenseContextValue = {
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
    invalidateCache,
  };

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
};

// Hook to use the expense context
export const useExpenseContext = (): ExpenseContextValue => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenseContext must be used within an ExpenseProvider');
  }
  return context;
};

export default ExpenseContext;
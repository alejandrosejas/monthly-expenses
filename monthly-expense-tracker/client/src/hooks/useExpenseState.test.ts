import { renderHook, act } from '@testing-library/react';
import { useExpenseState } from './useExpenseState';
import { useExpenseContext } from '../contexts/ExpenseContext';
import { Expense, Category, Budget, ExpenseInput, CategoryInput, BudgetInput } from 'shared';

import { vi } from 'vitest';

// Mock the expense context
vi.mock('../contexts/ExpenseContext');
const mockUseExpenseContext = useExpenseContext as any;

// Mock data
const mockExpenses: Expense[] = [
  {
    id: '1',
    date: '2024-01-15',
    amount: 50.00,
    category: 'food',
    description: 'Lunch',
    paymentMethod: 'credit',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    id: '2',
    date: '2024-01-16',
    amount: 25.00,
    category: 'transport',
    description: 'Bus fare',
    paymentMethod: 'cash',
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
];

const mockCategories: Category[] = [
  {
    id: 'food',
    name: 'Food',
    color: '#FF6B6B',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'transport',
    name: 'Transport',
    color: '#4ECDC4',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockBudget: Budget = {
  id: '1',
  month: '2024-01',
  totalBudget: 1000,
  categoryBudgets: { food: 300, transport: 200 },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockContextValue = {
  state: {
    expenses: { '2024-01': mockExpenses },
    categories: mockCategories,
    budgets: { '2024-01': mockBudget },
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
      expenses: { '2024-01': Date.now() },
      categories: Date.now(),
      budgets: { '2024-01': Date.now() },
    },
  },
  fetchExpenses: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  fetchCategories: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  fetchBudget: vi.fn(),
  updateBudget: vi.fn(),
  getExpensesForMonth: vi.fn((month: string) => mockExpenses),
  getCategoryById: vi.fn((id: string) => mockCategories.find(c => c.id === id)),
  getBudgetForMonth: vi.fn((month: string) => mockBudget),
  invalidateCache: vi.fn(),
};

describe('useExpenseState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseExpenseContext.mockReturnValue(mockContextValue);
  });

  describe('basic functionality', () => {
    it('should return current month data by default', () => {
      const { result } = renderHook(() => useExpenseState());

      expect(result.current.expenses).toEqual(mockExpenses);
      expect(result.current.categories).toEqual(mockCategories);
      expect(result.current.budget).toEqual(mockBudget);
    });

    it('should return specific month data when provided', () => {
      const { result } = renderHook(() => useExpenseState({ month: '2024-02' }));

      expect(mockContextValue.getExpensesForMonth).toHaveBeenCalledWith('2024-02');
      expect(mockContextValue.getBudgetForMonth).toHaveBeenCalledWith('2024-02');
    });

    it('should auto-fetch data when autoFetch is true', () => {
      renderHook(() => useExpenseState({ autoFetch: true }));

      expect(mockContextValue.fetchCategories).toHaveBeenCalled();
      expect(mockContextValue.fetchExpenses).toHaveBeenCalled();
      expect(mockContextValue.fetchBudget).toHaveBeenCalled();
    });

    it('should not auto-fetch data when autoFetch is false', () => {
      renderHook(() => useExpenseState({ autoFetch: false }));

      expect(mockContextValue.fetchCategories).not.toHaveBeenCalled();
      expect(mockContextValue.fetchExpenses).not.toHaveBeenCalled();
      expect(mockContextValue.fetchBudget).not.toHaveBeenCalled();
    });
  });

  describe('expense operations', () => {
    it('should add expense with current month context', async () => {
      const expenseInput: ExpenseInput = {
        date: '2024-01-17',
        amount: 30.00,
        category: 'food',
        description: 'Dinner',
        paymentMethod: 'credit',
      };

      const newExpense: Expense = {
        id: '3',
        ...expenseInput,
        createdAt: '2024-01-17T19:00:00Z',
        updatedAt: '2024-01-17T19:00:00Z',
      };

      mockContextValue.createExpense.mockResolvedValueOnce(newExpense);

      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      let addedExpense: Expense | null = null;
      await act(async () => {
        addedExpense = await result.current.addExpense(expenseInput);
      });

      expect(mockContextValue.createExpense).toHaveBeenCalledWith('2024-01', expenseInput);
      expect(addedExpense).toEqual(newExpense);
    });

    it('should update expense with current month context', async () => {
      const expenseInput: ExpenseInput = {
        date: '2024-01-15',
        amount: 55.00,
        category: 'food',
        description: 'Updated lunch',
        paymentMethod: 'credit',
      };

      const updatedExpense: Expense = {
        ...mockExpenses[0],
        ...expenseInput,
        updatedAt: '2024-01-15T13:00:00Z',
      };

      mockContextValue.updateExpense.mockResolvedValueOnce(updatedExpense);

      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      let updated: Expense | null = null;
      await act(async () => {
        updated = await result.current.updateExpense('1', expenseInput);
      });

      expect(mockContextValue.updateExpense).toHaveBeenCalledWith('2024-01', '1', expenseInput);
      expect(updated).toEqual(updatedExpense);
    });

    it('should delete expense with current month context', async () => {
      mockContextValue.deleteExpense.mockResolvedValueOnce(true);

      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteExpense('1');
      });

      expect(mockContextValue.deleteExpense).toHaveBeenCalledWith('2024-01', '1');
      expect(deleteResult).toBe(true);
    });
  });

  describe('category operations', () => {
    it('should add category', async () => {
      const categoryInput: CategoryInput = {
        name: 'Entertainment',
        color: '#9B59B6',
      };

      const newCategory: Category = {
        id: 'entertainment',
        ...categoryInput,
        isDefault: false,
        createdAt: '2024-01-17T10:00:00Z',
      };

      mockContextValue.createCategory.mockResolvedValueOnce(newCategory);

      const { result } = renderHook(() => useExpenseState());

      let addedCategory: Category | null = null;
      await act(async () => {
        addedCategory = await result.current.addCategory(categoryInput);
      });

      expect(mockContextValue.createCategory).toHaveBeenCalledWith(categoryInput);
      expect(addedCategory).toEqual(newCategory);
    });

    it('should update category', async () => {
      const categoryInput: CategoryInput = {
        name: 'Updated Food',
        color: '#E74C3C',
      };

      const updatedCategory: Category = {
        ...mockCategories[0],
        ...categoryInput,
      };

      mockContextValue.updateCategory.mockResolvedValueOnce(updatedCategory);

      const { result } = renderHook(() => useExpenseState());

      let updated: Category | null = null;
      await act(async () => {
        updated = await result.current.updateCategory('food', categoryInput);
      });

      expect(mockContextValue.updateCategory).toHaveBeenCalledWith('food', categoryInput);
      expect(updated).toEqual(updatedCategory);
    });

    it('should delete category', async () => {
      mockContextValue.deleteCategory.mockResolvedValueOnce(true);

      const { result } = renderHook(() => useExpenseState());

      let deleteResult: boolean = false;
      await act(async () => {
        deleteResult = await result.current.deleteCategory('food');
      });

      expect(mockContextValue.deleteCategory).toHaveBeenCalledWith('food');
      expect(deleteResult).toBe(true);
    });
  });

  describe('budget operations', () => {
    it('should update budget with current month context', async () => {
      const budgetInput: BudgetInput = {
        totalBudget: 1200,
        categoryBudgets: { food: 400, transport: 250 },
      };

      const updatedBudget: Budget = {
        ...mockBudget,
        ...budgetInput,
        updatedAt: '2024-01-17T10:00:00Z',
      };

      mockContextValue.updateBudget.mockResolvedValueOnce(updatedBudget);

      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      let updated: Budget | null = null;
      await act(async () => {
        updated = await result.current.updateBudget(budgetInput);
      });

      expect(mockContextValue.updateBudget).toHaveBeenCalledWith('2024-01', budgetInput);
      expect(updated).toEqual(updatedBudget);
    });
  });

  describe('utility functions', () => {
    it('should get category by id', () => {
      const { result } = renderHook(() => useExpenseState());

      const category = result.current.getCategoryById('food');
      expect(category).toEqual(mockCategories[0]);
    });

    it('should get expenses by category', () => {
      const { result } = renderHook(() => useExpenseState());

      const foodExpenses = result.current.getExpensesByCategory('food');
      expect(foodExpenses).toEqual([mockExpenses[0]]);
    });

    it('should calculate total expenses', () => {
      const { result } = renderHook(() => useExpenseState());

      const total = result.current.getTotalExpenses();
      expect(total).toBe(75.00); // 50 + 25
    });

    it('should calculate category totals', () => {
      const { result } = renderHook(() => useExpenseState());

      const categoryTotals = result.current.getCategoryTotals();
      expect(categoryTotals).toEqual({
        food: 50.00,
        transport: 25.00,
      });
    });

    it('should calculate budget status', () => {
      const { result } = renderHook(() => useExpenseState());

      const budgetStatus = result.current.getBudgetStatus();
      
      expect(budgetStatus.totalBudget).toBe(1000);
      expect(budgetStatus.totalSpent).toBe(75.00);
      expect(budgetStatus.remaining).toBe(925.00);
      expect(budgetStatus.percentUsed).toBe(7.5);
      expect(budgetStatus.isOverBudget).toBe(false);
      
      expect(budgetStatus.categoryStatus.food).toEqual({
        budget: 300,
        spent: 50.00,
        remaining: 250.00,
        percentUsed: 16.67, // Rounded to 2 decimal places
        isOverBudget: false,
      });
      
      expect(budgetStatus.categoryStatus.transport).toEqual({
        budget: 200,
        spent: 25.00,
        remaining: 175.00,
        percentUsed: 12.5,
        isOverBudget: false,
      });
    });

    it('should handle over-budget scenarios', () => {
      // Mock over-budget scenario
      const overBudgetExpenses: Expense[] = [
        {
          id: '1',
          date: '2024-01-15',
          amount: 1200.00, // Over total budget
          category: 'food',
          description: 'Expensive meal',
          paymentMethod: 'credit',
          createdAt: '2024-01-15T12:00:00Z',
          updatedAt: '2024-01-15T12:00:00Z',
        },
      ];

      mockContextValue.getExpensesForMonth.mockReturnValueOnce(overBudgetExpenses);

      const { result } = renderHook(() => useExpenseState());

      const budgetStatus = result.current.getBudgetStatus();
      
      expect(budgetStatus.isOverBudget).toBe(true);
      expect(budgetStatus.percentUsed).toBe(120);
      expect(budgetStatus.remaining).toBe(-200);
    });
  });

  describe('refresh operations', () => {
    it('should refresh expenses', async () => {
      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      await act(async () => {
        await result.current.refreshExpenses();
      });

      expect(mockContextValue.fetchExpenses).toHaveBeenCalledWith('2024-01', true);
    });

    it('should refresh categories', async () => {
      const { result } = renderHook(() => useExpenseState());

      await act(async () => {
        await result.current.refreshCategories();
      });

      expect(mockContextValue.fetchCategories).toHaveBeenCalledWith(true);
    });

    it('should refresh budget', async () => {
      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      await act(async () => {
        await result.current.refreshBudget();
      });

      expect(mockContextValue.fetchBudget).toHaveBeenCalledWith('2024-01', true);
    });
  });

  describe('cache management', () => {
    it('should invalidate cache', () => {
      const { result } = renderHook(() => useExpenseState({ month: '2024-01' }));

      act(() => {
        result.current.invalidateCache();
      });

      expect(mockContextValue.invalidateCache).toHaveBeenCalledWith('expenses', '2024-01');
      expect(mockContextValue.invalidateCache).toHaveBeenCalledWith('categories');
      expect(mockContextValue.invalidateCache).toHaveBeenCalledWith('budgets', '2024-01');
    });
  });

  describe('refresh interval', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should set up refresh interval when specified', () => {
      renderHook(() => useExpenseState({ 
        month: '2024-01',
        refreshInterval: 5000 
      }));

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockContextValue.fetchCategories).toHaveBeenCalledWith(true);
      expect(mockContextValue.fetchExpenses).toHaveBeenCalledWith('2024-01', true);
      expect(mockContextValue.fetchBudget).toHaveBeenCalledWith('2024-01', true);
    });

    it('should not set up refresh interval when not specified', () => {
      renderHook(() => useExpenseState({ month: '2024-01' }));

      // Fast-forward time
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Should only be called once during initial fetch
      expect(mockContextValue.fetchCategories).toHaveBeenCalledTimes(1);
      expect(mockContextValue.fetchExpenses).toHaveBeenCalledTimes(1);
      expect(mockContextValue.fetchBudget).toHaveBeenCalledTimes(1);
    });
  });
});
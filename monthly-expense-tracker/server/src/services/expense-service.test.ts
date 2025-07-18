import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ExpenseService } from './expense-service';
import { repositories } from '../database';
import { NotFoundError } from '../utils/errors';

// Mock the repositories
vi.mock('../database', () => {
  return {
    repositories: {
      expense: {
        findWithFilters: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
        getMonthlySummary: vi.fn(),
        getDailyTotals: vi.fn(),
        getMonthlyTotals: vi.fn(),
        findByCategory: vi.fn(),
        findByMonth: vi.fn()
      },
      category: {
        findById: vi.fn()
      }
    }
  };
});

describe('ExpenseService', () => {
  let expenseService: ExpenseService;
  const mockExpense = {
    id: 'exp-1',
    date: '2023-01-15',
    amount: 25.50,
    category: 'cat-1',
    description: 'Lunch',
    paymentMethod: 'credit',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-01-15T12:00:00Z'
  };
  
  beforeEach(() => {
    expenseService = new ExpenseService();
    vi.clearAllMocks();
  });
  
  describe('getExpenses', () => {
    it('should return expenses with pagination', async () => {
      const mockResult = {
        expenses: [mockExpense],
        total: 1
      };
      
      vi.mocked(repositories.expense.findWithFilters).mockResolvedValue(mockResult);
      
      const result = await expenseService.getExpenses(
        { searchTerm: 'lunch' },
        { page: 1, limit: 10 }
      );
      
      expect(result).toEqual(mockResult);
      expect(repositories.expense.findWithFilters).toHaveBeenCalledWith(
        { searchTerm: 'lunch' },
        { page: 1, limit: 10 }
      );
    });
  });
  
  describe('getExpenseById', () => {
    it('should return an expense when found', async () => {
      vi.mocked(repositories.expense.findById).mockResolvedValue(mockExpense);
      
      const result = await expenseService.getExpenseById('exp-1');
      
      expect(result).toEqual(mockExpense);
      expect(repositories.expense.findById).toHaveBeenCalledWith('exp-1');
    });
    
    it('should throw NotFoundError when expense not found', async () => {
      vi.mocked(repositories.expense.findById).mockResolvedValue(undefined);
      
      await expect(expenseService.getExpenseById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('createExpense', () => {
    it('should create an expense when category exists', async () => {
      const mockCategory = { id: 'cat-1', name: 'Food' };
      const expenseInput = {
        date: '2023-01-15',
        amount: 25.50,
        category: 'cat-1',
        description: 'Lunch',
        paymentMethod: 'credit' as const
      };
      
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.expense.create).mockResolvedValue(mockExpense);
      
      const result = await expenseService.createExpense(expenseInput);
      
      expect(result).toEqual(mockExpense);
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-1');
      expect(repositories.expense.create).toHaveBeenCalledWith(expenseInput);
    });
    
    it('should throw NotFoundError when category does not exist', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      const expenseInput = {
        date: '2023-01-15',
        amount: 25.50,
        category: 'non-existent',
        description: 'Lunch',
        paymentMethod: 'credit' as const
      };
      
      await expect(expenseService.createExpense(expenseInput)).rejects.toThrow(NotFoundError);
      expect(repositories.expense.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateExpense', () => {
    it('should update an expense when it exists', async () => {
      const updateData = { amount: 30.00 };
      const updatedExpense = { ...mockExpense, amount: 30.00 };
      
      vi.mocked(repositories.expense.findById).mockResolvedValue(mockExpense);
      vi.mocked(repositories.expense.update).mockResolvedValue(updatedExpense);
      
      const result = await expenseService.updateExpense('exp-1', updateData);
      
      expect(result).toEqual(updatedExpense);
      expect(repositories.expense.findById).toHaveBeenCalledWith('exp-1');
      expect(repositories.expense.update).toHaveBeenCalledWith('exp-1', updateData);
    });
    
    it('should throw NotFoundError when expense does not exist', async () => {
      vi.mocked(repositories.expense.findById).mockResolvedValue(undefined);
      
      await expect(expenseService.updateExpense('non-existent', { amount: 30.00 })).rejects.toThrow(NotFoundError);
      expect(repositories.expense.update).not.toHaveBeenCalled();
    });
    
    it('should validate category when updating category', async () => {
      const updateData = { category: 'cat-2' };
      const mockCategory = { id: 'cat-2', name: 'Transportation' };
      
      vi.mocked(repositories.expense.findById).mockResolvedValue(mockExpense);
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.expense.update).mockResolvedValue({ ...mockExpense, category: 'cat-2' });
      
      const result = await expenseService.updateExpense('exp-1', updateData);
      
      expect(result.category).toBe('cat-2');
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-2');
    });
    
    it('should throw NotFoundError when updating to non-existent category', async () => {
      vi.mocked(repositories.expense.findById).mockResolvedValue(mockExpense);
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      await expect(expenseService.updateExpense('exp-1', { category: 'non-existent' })).rejects.toThrow(NotFoundError);
      expect(repositories.expense.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteExpense', () => {
    it('should delete an expense when it exists', async () => {
      vi.mocked(repositories.expense.deleteById).mockResolvedValue(true);
      
      await expenseService.deleteExpense('exp-1');
      
      expect(repositories.expense.deleteById).toHaveBeenCalledWith('exp-1');
    });
    
    it('should throw NotFoundError when expense does not exist', async () => {
      vi.mocked(repositories.expense.deleteById).mockResolvedValue(false);
      
      await expect(expenseService.deleteExpense('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('getMonthlySummary', () => {
    it('should return monthly summary', async () => {
      const mockSummary = [
        { category: 'cat-1', total: 100 },
        { category: 'cat-2', total: 200 }
      ];
      
      vi.mocked(repositories.expense.getMonthlySummary).mockResolvedValue(mockSummary);
      
      const result = await expenseService.getMonthlySummary('2023-01');
      
      expect(result).toEqual(mockSummary);
      expect(repositories.expense.getMonthlySummary).toHaveBeenCalledWith('2023-01');
    });
  });
  
  describe('getDailyTotals', () => {
    it('should return daily totals', async () => {
      const mockDailyTotals = [
        { date: '2023-01-01', total: 50 },
        { date: '2023-01-02', total: 75 }
      ];
      
      vi.mocked(repositories.expense.getDailyTotals).mockResolvedValue(mockDailyTotals);
      
      const result = await expenseService.getDailyTotals('2023-01');
      
      expect(result).toEqual(mockDailyTotals);
      expect(repositories.expense.getDailyTotals).toHaveBeenCalledWith('2023-01');
    });
  });
  
  describe('getMonthlyTotals', () => {
    it('should return monthly totals', async () => {
      const mockMonthlyTotals = [
        { month: '2023-01', total: 500 },
        { month: '2023-02', total: 600 }
      ];
      
      vi.mocked(repositories.expense.getMonthlyTotals).mockResolvedValue(mockMonthlyTotals);
      
      const result = await expenseService.getMonthlyTotals('2023-01', '2023-02');
      
      expect(result).toEqual(mockMonthlyTotals);
      expect(repositories.expense.getMonthlyTotals).toHaveBeenCalledWith('2023-01', '2023-02');
    });
  });
  
  describe('getExpensesByCategory', () => {
    it('should return expenses for a category', async () => {
      const mockCategory = { id: 'cat-1', name: 'Food' };
      const mockExpenses = [mockExpense];
      
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.expense.findByCategory).mockResolvedValue(mockExpenses);
      
      const result = await expenseService.getExpensesByCategory('cat-1');
      
      expect(result).toEqual(mockExpenses);
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-1');
      expect(repositories.expense.findByCategory).toHaveBeenCalledWith('cat-1');
    });
    
    it('should throw NotFoundError when category does not exist', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      await expect(expenseService.getExpensesByCategory('non-existent')).rejects.toThrow(NotFoundError);
      expect(repositories.expense.findByCategory).not.toHaveBeenCalled();
    });
  });
  
  describe('getExpensesByMonth', () => {
    it('should return expenses for a month', async () => {
      const mockExpenses = [mockExpense];
      
      vi.mocked(repositories.expense.findByMonth).mockResolvedValue(mockExpenses);
      
      const result = await expenseService.getExpensesByMonth('2023-01');
      
      expect(result).toEqual(mockExpenses);
      expect(repositories.expense.findByMonth).toHaveBeenCalledWith('2023-01');
    });
  });
});
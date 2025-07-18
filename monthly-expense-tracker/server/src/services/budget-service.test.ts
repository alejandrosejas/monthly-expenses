import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BudgetService } from './budget-service';
import { repositories } from '../database';
import { NotFoundError } from '../utils/errors';

// Mock the repositories
vi.mock('../database', () => {
  return {
    repositories: {
      budget: {
        findByMonth: vi.fn(),
        createOrUpdateForMonth: vi.fn(),
        deleteById: vi.fn(),
        findByMonthRange: vi.fn()
      },
      expense: {
        findByMonth: vi.fn()
      },
      category: {
        findAll: vi.fn(),
        findById: vi.fn()
      }
    }
  };
});

describe('BudgetService', () => {
  let budgetService: BudgetService;
  const mockBudget = {
    id: 'budget-1',
    month: '2023-01',
    totalBudget: 1000,
    categoryBudgets: {
      'cat-1': 500,
      'cat-2': 300
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };
  
  const mockExpenses = [
    {
      id: 'exp-1',
      date: '2023-01-15',
      amount: 200,
      category: 'cat-1',
      description: 'Groceries',
      paymentMethod: 'credit',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    },
    {
      id: 'exp-2',
      date: '2023-01-20',
      amount: 150,
      category: 'cat-2',
      description: 'Gas',
      paymentMethod: 'debit',
      createdAt: '2023-01-20T00:00:00Z',
      updatedAt: '2023-01-20T00:00:00Z'
    }
  ];
  
  const mockCategories = [
    {
      id: 'cat-1',
      name: 'Food',
      color: '#FF0000',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'cat-2',
      name: 'Transportation',
      color: '#00FF00',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z'
    }
  ];
  
  beforeEach(() => {
    budgetService = new BudgetService();
    vi.clearAllMocks();
  });
  
  describe('getBudgetByMonth', () => {
    it('should return a budget when found', async () => {
      vi.mocked(repositories.budget.findByMonth).mockResolvedValue(mockBudget);
      
      const result = await budgetService.getBudgetByMonth('2023-01');
      
      expect(result).toEqual(mockBudget);
      expect(repositories.budget.findByMonth).toHaveBeenCalledWith('2023-01');
    });
    
    it('should return null when budget not found', async () => {
      vi.mocked(repositories.budget.findByMonth).mockResolvedValue(undefined);
      
      const result = await budgetService.getBudgetByMonth('2023-02');
      
      expect(result).toBeNull();
      expect(repositories.budget.findByMonth).toHaveBeenCalledWith('2023-02');
    });
  });
  
  describe('createOrUpdateBudget', () => {
    it('should create or update a budget', async () => {
      const budgetInput = {
        month: '2023-01',
        totalBudget: 1000,
        categoryBudgets: {
          'cat-1': 500,
          'cat-2': 300
        }
      };
      
      vi.mocked(repositories.category.findById).mockImplementation(async (id) => {
        return mockCategories.find(cat => cat.id === id);
      });
      
      vi.mocked(repositories.budget.createOrUpdateForMonth).mockResolvedValue(mockBudget);
      
      const result = await budgetService.createOrUpdateBudget(budgetInput);
      
      expect(result).toEqual(mockBudget);
      expect(repositories.category.findById).toHaveBeenCalledTimes(2);
      expect(repositories.budget.createOrUpdateForMonth).toHaveBeenCalledWith('2023-01', budgetInput);
    });
    
    it('should throw NotFoundError when category does not exist', async () => {
      const budgetInput = {
        month: '2023-01',
        totalBudget: 1000,
        categoryBudgets: {
          'cat-1': 500,
          'non-existent': 300
        }
      };
      
      vi.mocked(repositories.category.findById).mockImplementation(async (id) => {
        return id === 'cat-1' ? mockCategories[0] : undefined;
      });
      
      await expect(budgetService.createOrUpdateBudget(budgetInput)).rejects.toThrow(NotFoundError);
      expect(repositories.budget.createOrUpdateForMonth).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteBudget', () => {
    it('should delete a budget', async () => {
      vi.mocked(repositories.budget.deleteById).mockResolvedValue(true);
      
      await budgetService.deleteBudget('budget-1');
      
      expect(repositories.budget.deleteById).toHaveBeenCalledWith('budget-1');
    });
    
    it('should throw NotFoundError when budget does not exist', async () => {
      vi.mocked(repositories.budget.deleteById).mockResolvedValue(false);
      
      await expect(budgetService.deleteBudget('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('getBudgetStatus', () => {
    it('should return budget status with expenses', async () => {
      vi.mocked(repositories.budget.findByMonth).mockResolvedValue(mockBudget);
      vi.mocked(repositories.expense.findByMonth).mockResolvedValue(mockExpenses);
      vi.mocked(repositories.category.findAll).mockResolvedValue(mockCategories);
      
      const result = await budgetService.getBudgetStatus('2023-01');
      
      expect(result).toBeDefined();
      expect(result.month).toBe('2023-01');
      expect(result.totalBudget).toBe(1000);
      expect(result.totalSpent).toBe(350); // 200 + 150
      expect(result.totalRemaining).toBe(650); // 1000 - 350
      expect(result.percentageUsed).toBe(35); // (350 / 1000) * 100
      expect(result.categories).toHaveLength(2);
      
      // Check first category
      expect(result.categories[0].categoryId).toBe('cat-1');
      expect(result.categories[0].categoryName).toBe('Food');
      expect(result.categories[0].budgeted).toBe(500);
      expect(result.categories[0].spent).toBe(200);
      expect(result.categories[0].remaining).toBe(300);
      expect(result.categories[0].percentage).toBe(40); // (200 / 500) * 100
      expect(result.categories[0].status).toBe('normal');
      
      // Check second category
      expect(result.categories[1].categoryId).toBe('cat-2');
      expect(result.categories[1].categoryName).toBe('Transportation');
      expect(result.categories[1].budgeted).toBe(300);
      expect(result.categories[1].spent).toBe(150);
      expect(result.categories[1].remaining).toBe(150);
      expect(result.categories[1].percentage).toBe(50); // (150 / 300) * 100
      expect(result.categories[1].status).toBe('normal');
    });
    
    it('should return empty budget status when no budget exists', async () => {
      vi.mocked(repositories.budget.findByMonth).mockResolvedValue(undefined);
      
      const result = await budgetService.getBudgetStatus('2023-02');
      
      expect(result).toBeDefined();
      expect(result.month).toBe('2023-02');
      expect(result.totalBudget).toBe(0);
      expect(result.totalSpent).toBe(0);
      expect(result.totalRemaining).toBe(0);
      expect(result.percentageUsed).toBe(0);
      expect(result.categories).toEqual([]);
    });
    
    it('should handle warning and exceeded status based on percentage', async () => {
      const warningBudget = {
        ...mockBudget,
        categoryBudgets: {
          'cat-1': 250, // 200 / 250 = 80% (warning)
          'cat-2': 100  // 150 / 100 = 150% (exceeded)
        }
      };
      
      vi.mocked(repositories.budget.findByMonth).mockResolvedValue(warningBudget);
      vi.mocked(repositories.expense.findByMonth).mockResolvedValue(mockExpenses);
      vi.mocked(repositories.category.findAll).mockResolvedValue(mockCategories);
      
      const result = await budgetService.getBudgetStatus('2023-01');
      
      // Check first category (warning)
      expect(result.categories[0].categoryId).toBe('cat-1');
      expect(result.categories[0].percentage).toBe(80); // (200 / 250) * 100
      expect(result.categories[0].status).toBe('warning');
      
      // Check second category (exceeded)
      expect(result.categories[1].categoryId).toBe('cat-2');
      expect(result.categories[1].percentage).toBe(150); // (150 / 100) * 100
      expect(result.categories[1].status).toBe('exceeded');
    });
  });
  
  describe('getBudgetsByMonthRange', () => {
    it('should return budgets for a range of months', async () => {
      const mockBudgets = [
        mockBudget,
        {
          ...mockBudget,
          id: 'budget-2',
          month: '2023-02',
          updatedAt: '2023-02-01T00:00:00Z'
        }
      ];
      
      vi.mocked(repositories.budget.findByMonthRange).mockResolvedValue(mockBudgets);
      
      const result = await budgetService.getBudgetsByMonthRange('2023-01', '2023-02');
      
      expect(result).toEqual(mockBudgets);
      expect(repositories.budget.findByMonthRange).toHaveBeenCalledWith('2023-01', '2023-02');
    });
  });
});
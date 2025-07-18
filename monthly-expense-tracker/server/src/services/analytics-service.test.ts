import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from './analytics-service';
import { ExpenseRepository } from '../database/expense-repository';
import { CategoryRepository } from '../database/category-repository';

// Mock repositories
vi.mock('../database/expense-repository');
vi.mock('../database/category-repository');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockExpenseRepository: ExpenseRepository;
  let mockCategoryRepository: CategoryRepository;

  beforeEach(() => {
    mockExpenseRepository = new ExpenseRepository();
    mockCategoryRepository = new CategoryRepository();
    analyticsService = new AnalyticsService(mockExpenseRepository, mockCategoryRepository);
  });

  describe('getCategoryBreakdown', () => {
    it('should return category breakdown for a month', async () => {
      // Mock data
      const mockExpenses = [
        { id: '1', date: '2023-03-01', amount: 100, category: 'Food', description: 'Groceries', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
        { id: '2', date: '2023-03-15', amount: 150, category: 'Food', description: 'Restaurant', paymentMethod: 'credit', createdAt: '', updatedAt: '' },
        { id: '3', date: '2023-03-20', amount: 200, category: 'Transport', description: 'Gas', paymentMethod: 'debit', createdAt: '', updatedAt: '' }
      ];

      const mockCategories = [
        { id: '1', name: 'Food', color: '#FF5733', isDefault: true, createdAt: '' },
        { id: '2', name: 'Transport', color: '#33FF57', isDefault: true, createdAt: '' }
      ];

      // Setup mocks
      vi.mocked(mockExpenseRepository.findByDateRange).mockResolvedValue(mockExpenses);
      vi.mocked(mockCategoryRepository.findAll).mockResolvedValue(mockCategories);

      // Execute
      const result = await analyticsService.getCategoryBreakdown('2023-03');

      // Verify
      expect(mockExpenseRepository.findByDateRange).toHaveBeenCalledWith('2023-03-01', '2023-03-31');
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
      
      expect(result).toHaveLength(2);
      
      // Food category (should be first as it has the highest amount)
      expect(result[0].category).toBe('Food');
      expect(result[0].amount).toBe(250);
      expect(result[0].percentage).toBeCloseTo(55.56, 1); // 250/450 * 100
      expect(result[0].color).toBe('#FF5733');
      
      // Transport category
      expect(result[1].category).toBe('Transport');
      expect(result[1].amount).toBe(200);
      expect(result[1].percentage).toBeCloseTo(44.44, 1); // 200/450 * 100
      expect(result[1].color).toBe('#33FF57');
    });

    it('should handle empty expenses', async () => {
      // Setup mocks
      vi.mocked(mockExpenseRepository.findByDateRange).mockResolvedValue([]);
      vi.mocked(mockCategoryRepository.findAll).mockResolvedValue([]);

      // Execute
      const result = await analyticsService.getCategoryBreakdown('2023-03');

      // Verify
      expect(result).toHaveLength(0);
    });
  });

  describe('getMonthlyTotals', () => {
    it('should return monthly totals for the specified number of months', async () => {
      // Mock data
      const mockExpenses = [
        { id: '1', date: '2023-01-15', amount: 100, category: 'Food', description: 'Groceries', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
        { id: '2', date: '2023-02-10', amount: 150, category: 'Food', description: 'Restaurant', paymentMethod: 'credit', createdAt: '', updatedAt: '' },
        { id: '3', date: '2023-03-20', amount: 200, category: 'Transport', description: 'Gas', paymentMethod: 'debit', createdAt: '', updatedAt: '' }
      ];

      // Setup mocks
      vi.mocked(mockExpenseRepository.findByMonthRange).mockResolvedValue(mockExpenses);

      // Execute
      const result = await analyticsService.getMonthlyTotals('2023-03', 3);

      // Verify
      expect(mockExpenseRepository.findByMonthRange).toHaveBeenCalledWith('2023-01', '2023-03');
      
      expect(result).toHaveLength(3);
      expect(result[0].month).toBe('2023-01');
      expect(result[0].total).toBe(100);
      expect(result[1].month).toBe('2023-02');
      expect(result[1].total).toBe(150);
      expect(result[2].month).toBe('2023-03');
      expect(result[2].total).toBe(200);
    });
  });

  describe('getDailyTotals', () => {
    it('should return daily totals for a month', async () => {
      // Mock data
      const mockExpenses = [
        { id: '1', date: '2023-03-01', amount: 100, category: 'Food', description: 'Groceries', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
        { id: '2', date: '2023-03-01', amount: 50, category: 'Transport', description: 'Bus', paymentMethod: 'cash', createdAt: '', updatedAt: '' },
        { id: '3', date: '2023-03-15', amount: 200, category: 'Food', description: 'Restaurant', paymentMethod: 'credit', createdAt: '', updatedAt: '' }
      ];

      // Setup mocks
      vi.mocked(mockExpenseRepository.findByDateRange).mockResolvedValue(mockExpenses);

      // Execute
      const result = await analyticsService.getDailyTotals('2023-03');

      // Verify
      expect(mockExpenseRepository.findByDateRange).toHaveBeenCalledWith('2023-03-01', '2023-03-31');
      
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2023-03-01');
      expect(result[0].total).toBe(150); // 100 + 50
      expect(result[1].date).toBe('2023-03-15');
      expect(result[1].total).toBe(200);
    });
  });

  describe('compareMonths', () => {
    it('should compare expenses between two months', async () => {
      // Mock implementation for getCategoryBreakdown
      const mockCurrentBreakdown = [
        { category: 'Food', amount: 250, percentage: 50, color: '#FF5733' },
        { category: 'Transport', amount: 150, percentage: 30, color: '#33FF57' },
        { category: 'Entertainment', amount: 100, percentage: 20, color: '#3357FF' }
      ];
      
      const mockPreviousBreakdown = [
        { category: 'Food', amount: 200, percentage: 50, color: '#FF5733' },
        { category: 'Transport', amount: 180, percentage: 45, color: '#33FF57' },
        { category: 'Healthcare', amount: 20, percentage: 5, color: '#57FF33' }
      ];
      
      // Setup mock for getCategoryBreakdown
      vi.spyOn(analyticsService, 'getCategoryBreakdown').mockImplementation((month) => {
        if (month === '2023-03') {
          return Promise.resolve(mockCurrentBreakdown);
        } else {
          return Promise.resolve(mockPreviousBreakdown);
        }
      });

      // Execute
      const result = await analyticsService.compareMonths('2023-03', '2023-02');

      // Verify
      expect(analyticsService.getCategoryBreakdown).toHaveBeenCalledWith('2023-03');
      expect(analyticsService.getCategoryBreakdown).toHaveBeenCalledWith('2023-02');
      
      // Should have 4 categories total (Food, Transport, Entertainment, Healthcare)
      expect(result).toHaveLength(4);
      
      // Check a few specific results
      const food = result.find(item => item.category === 'Food');
      expect(food).toBeDefined();
      expect(food?.currentMonth.amount).toBe(250);
      expect(food?.previousMonth.amount).toBe(200);
      expect(food?.difference).toBe(50);
      expect(food?.percentageChange).toBe(25); // (250-200)/200 * 100
      
      const healthcare = result.find(item => item.category === 'Healthcare');
      expect(healthcare).toBeDefined();
      expect(healthcare?.currentMonth.amount).toBe(0); // Not present in current month
      expect(healthcare?.previousMonth.amount).toBe(20);
      expect(healthcare?.difference).toBe(-20);
      expect(healthcare?.percentageChange).toBe(-100); // (0-20)/20 * 100
      
      const entertainment = result.find(item => item.category === 'Entertainment');
      expect(entertainment).toBeDefined();
      expect(entertainment?.currentMonth.amount).toBe(100);
      expect(entertainment?.previousMonth.amount).toBe(0); // Not present in previous month
      expect(entertainment?.difference).toBe(100);
      expect(entertainment?.percentageChange).toBe(100); // New category, so 100% increase
    });
  });
});
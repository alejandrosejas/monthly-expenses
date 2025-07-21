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

  describe('getTrendAnalysis', () => {
    it('should return comprehensive trend analysis', async () => {
      // Mock monthly totals data
      const mockMonthlyTotals = [
        { month: '2023-01', total: 400 },
        { month: '2023-02', total: 500 },
        { month: '2023-03', total: 450 },
        { month: '2023-04', total: 600 },
        { month: '2023-05', total: 550 },
        { month: '2023-06', total: 700 }
      ];

      // Setup mock for getMonthlyTotals
      vi.spyOn(analyticsService, 'getMonthlyTotals').mockResolvedValue(mockMonthlyTotals);

      // Execute
      const result = await analyticsService.getTrendAnalysis('2023-06', 6);

      // Verify
      expect(analyticsService.getMonthlyTotals).toHaveBeenCalledWith('2023-06', 6);
      
      // Check basic structure
      expect(result.currentMonth.month).toBe('2023-06');
      expect(result.currentMonth.total).toBe(700);
      
      // Check average spending calculation
      const expectedAverage = (400 + 500 + 450 + 600 + 550 + 700) / 6;
      expect(result.averageSpending).toBeCloseTo(expectedAverage, 2);
      
      // Check monthly changes
      expect(result.monthlyChanges).toHaveLength(5); // 6 months - 1 = 5 changes
      expect(result.monthlyChanges[0].month).toBe('2023-02');
      expect(result.monthlyChanges[0].change).toBe(100); // 500 - 400
      expect(result.monthlyChanges[0].percentageChange).toBe(25); // (100/400) * 100
      
      // Check trend direction (should be increasing since last 3 months: 600, 550, 700)
      expect(result.trendDirection).toBe('increasing');
      
      // Check that insights are generated
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.insights.length).toBeGreaterThan(0);
      
      // Check volatility is calculated
      expect(result.volatility).toBeGreaterThan(0);
      
      // Check average monthly change
      const expectedAvgChange = (100 - 50 + 150 - 50 + 150) / 5; // Sum of changes / number of changes
      expect(result.averageMonthlyChange).toBeCloseTo(expectedAvgChange, 2);
    });

    it('should handle decreasing trend', async () => {
      // Mock monthly totals with decreasing trend
      const mockMonthlyTotals = [
        { month: '2023-01', total: 700 },
        { month: '2023-02', total: 600 },
        { month: '2023-03', total: 500 }
      ];

      vi.spyOn(analyticsService, 'getMonthlyTotals').mockResolvedValue(mockMonthlyTotals);

      const result = await analyticsService.getTrendAnalysis('2023-03', 3);

      expect(result.trendDirection).toBe('decreasing');
    });

    it('should handle stable trend', async () => {
      // Mock monthly totals with stable trend
      const mockMonthlyTotals = [
        { month: '2023-01', total: 500 },
        { month: '2023-02', total: 510 },
        { month: '2023-03', total: 505 }
      ];

      vi.spyOn(analyticsService, 'getMonthlyTotals').mockResolvedValue(mockMonthlyTotals);

      const result = await analyticsService.getTrendAnalysis('2023-03', 3);

      expect(result.trendDirection).toBe('stable');
    });

    it('should throw error when no data available', async () => {
      vi.spyOn(analyticsService, 'getMonthlyTotals').mockResolvedValue([]);

      await expect(analyticsService.getTrendAnalysis('2023-03', 3))
        .rejects.toThrow('No data available for trend analysis');
    });
  });
});
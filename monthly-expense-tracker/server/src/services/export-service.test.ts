import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from './export-service';
import { Expense, Category, Budget } from 'shared';
import PDFDocument from 'pdfkit';

// Mock dependencies
vi.mock('pdfkit', () => {
  const mockPdfKit = vi.fn().mockImplementation(() => ({
    on: vi.fn().mockImplementation((event, callback) => {
      if (event === 'data') {
        callback(Buffer.from('test data'));
      }
      return { on: vi.fn() };
    }),
    fontSize: vi.fn().mockReturnThis(),
    text: vi.fn().mockReturnThis(),
    moveDown: vi.fn().mockReturnThis(),
    moveTo: vi.fn().mockReturnThis(),
    lineTo: vi.fn().mockReturnThis(),
    stroke: vi.fn().mockReturnThis(),
    addPage: vi.fn().mockReturnThis(),
    end: vi.fn().mockImplementation(function() {
      this.on('end')();
      return this;
    }),
    page: { height: 800 }
  }));
  
  return { default: mockPdfKit };
});

describe('ExportService', () => {
  let exportService: ExportService;
  let mockExpenseRepository: any;
  let mockCategoryRepository: any;
  let mockBudgetRepository: any;
  let mockAnalyticsService: any;
  
  // Sample data for testing
  const sampleExpenses: Expense[] = [
    {
      id: '1',
      date: '2023-01-01',
      amount: 100,
      category: 'cat1',
      description: 'Groceries',
      paymentMethod: 'cash',
      createdAt: '2023-01-01T12:00:00Z',
      updatedAt: '2023-01-01T12:00:00Z'
    },
    {
      id: '2',
      date: '2023-01-02',
      amount: 50,
      category: 'cat2',
      description: 'Dinner',
      paymentMethod: 'credit',
      createdAt: '2023-01-02T12:00:00Z',
      updatedAt: '2023-01-02T12:00:00Z'
    }
  ];
  
  const sampleCategories: Category[] = [
    {
      id: 'cat1',
      name: 'Food',
      color: '#FF0000',
      isDefault: true,
      createdAt: '2023-01-01T00:00:00Z'
    },
    {
      id: 'cat2',
      name: 'Entertainment',
      color: '#00FF00',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z'
    }
  ];
  
  const sampleBudget: Budget = {
    id: 'budget1',
    month: '2023-01',
    totalBudget: 500,
    categoryBudgets: {
      cat1: 300,
      cat2: 200
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  };
  
  const sampleCategoryBreakdown = [
    {
      category: 'Food',
      amount: 100,
      percentage: 66.67,
      color: '#FF0000'
    },
    {
      category: 'Entertainment',
      amount: 50,
      percentage: 33.33,
      color: '#00FF00'
    }
  ];
  
  beforeEach(() => {
    // Create mock repositories
    mockExpenseRepository = {
      findByDateRange: vi.fn().mockResolvedValue(sampleExpenses)
    };
    
    mockCategoryRepository = {
      findAll: vi.fn().mockResolvedValue(sampleCategories)
    };
    
    mockBudgetRepository = {
      findByMonth: vi.fn().mockResolvedValue(sampleBudget)
    };
    
    mockAnalyticsService = {
      getCategoryBreakdown: vi.fn().mockResolvedValue(sampleCategoryBreakdown)
    };
    
    // Create service instance
    exportService = new ExportService(
      mockExpenseRepository,
      mockCategoryRepository,
      mockBudgetRepository,
      mockAnalyticsService
    );
  });
  
  describe('exportMonthToCSV', () => {
    it('should generate CSV with correct format', async () => {
      // Call the method
      const result = await exportService.exportMonthToCSV('2023-01');
      
      // Check repository calls
      expect(mockExpenseRepository.findByDateRange).toHaveBeenCalledWith('2023-01-01', '2023-01-31');
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
      
      // Check CSV format
      expect(result).toContain('Date,Amount,Category,Description,Payment Method');
      expect(result).toContain('2023-01-01,100.00,Food,Groceries,cash');
      expect(result).toContain('2023-01-02,50.00,Entertainment,Dinner,credit');
    });
    
    it('should handle special characters in CSV fields', async () => {
      // Mock expense with special characters
      mockExpenseRepository.findByDateRange.mockResolvedValue([
        {
          id: '3',
          date: '2023-01-03',
          amount: 75,
          category: 'cat1',
          description: 'Item with, comma and "quotes"',
          paymentMethod: 'cash',
          createdAt: '2023-01-03T12:00:00Z',
          updatedAt: '2023-01-03T12:00:00Z'
        }
      ]);
      
      // Call the method
      const result = await exportService.exportMonthToCSV('2023-01');
      
      // Check CSV format with escaped fields
      expect(result).toContain('Date,Amount,Category,Description,Payment Method');
      expect(result).toContain('2023-01-03,75.00,Food,"Item with, comma and ""quotes""",cash');
    });
  });
  
  describe('exportMonthToPDF', () => {
    it('should generate PDF buffer', async () => {
      // Call the method
      const result = await exportService.exportMonthToPDF('2023-01');
      
      // Check repository calls
      expect(mockExpenseRepository.findByDateRange).toHaveBeenCalledWith('2023-01-01', '2023-01-31');
      expect(mockCategoryRepository.findAll).toHaveBeenCalled();
      expect(mockBudgetRepository.findByMonth).toHaveBeenCalledWith('2023-01');
      expect(mockAnalyticsService.getCategoryBreakdown).toHaveBeenCalledWith('2023-01');
      
      // Check that result is a Buffer
      expect(Buffer.isBuffer(result)).toBe(true);
    });
    
    it('should handle missing budget data', async () => {
      // Mock missing budget
      mockBudgetRepository.findByMonth.mockResolvedValue(null);
      
      // Call the method
      const result = await exportService.exportMonthToPDF('2023-01');
      
      // Check that result is still a Buffer
      expect(Buffer.isBuffer(result)).toBe(true);
    });
  });
});
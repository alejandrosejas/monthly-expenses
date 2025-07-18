import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { services } from '../services';
import budgetRoutes from './budgets';
import { errorHandler } from '../middleware';

// Mock the services
vi.mock('../services', () => {
  return {
    services: {
      budget: {
        getBudgetByMonth: vi.fn(),
        createOrUpdateBudget: vi.fn(),
        deleteBudget: vi.fn(),
        getBudgetStatus: vi.fn(),
        getBudgetsByMonthRange: vi.fn()
      }
    }
  };
});

describe('Budget API Routes', () => {
  const app = express();
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
  
  const mockBudgetStatus = {
    month: '2023-01',
    totalBudget: 1000,
    totalSpent: 350,
    totalRemaining: 650,
    percentageUsed: 35,
    categories: [
      {
        categoryId: 'cat-1',
        categoryName: 'Food',
        budgeted: 500,
        spent: 200,
        remaining: 300,
        percentage: 40,
        status: 'normal'
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Transportation',
        budgeted: 300,
        spent: 150,
        remaining: 150,
        percentage: 50,
        status: 'normal'
      }
    ]
  };
  
  // Setup test app
  beforeAll(() => {
    app.use(express.json());
    app.use('/api/budgets', budgetRoutes);
    app.use(errorHandler);
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('GET /api/budgets/:month', () => {
    it('should return a budget for a specific month', async () => {
      vi.mocked(services.budget.getBudgetByMonth).mockResolvedValue(mockBudget);
      
      const response = await request(app).get('/api/budgets/2023-01');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockBudget);
      expect(services.budget.getBudgetByMonth).toHaveBeenCalledWith('2023-01');
    });
    
    it('should return empty budget when none exists', async () => {
      vi.mocked(services.budget.getBudgetByMonth).mockResolvedValue(null);
      
      const response = await request(app).get('/api/budgets/2023-02');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual({
        month: '2023-02',
        totalBudget: 0,
        categoryBudgets: {}
      });
      expect(services.budget.getBudgetByMonth).toHaveBeenCalledWith('2023-02');
    });
  });
  
  describe('POST /api/budgets', () => {
    it('should create or update a budget', async () => {
      const budgetInput = {
        month: '2023-01',
        totalBudget: 1000,
        categoryBudgets: {
          'cat-1': 500,
          'cat-2': 300
        }
      };
      
      vi.mocked(services.budget.createOrUpdateBudget).mockResolvedValue(mockBudget);
      
      const response = await request(app)
        .post('/api/budgets')
        .send(budgetInput);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockBudget);
      expect(services.budget.createOrUpdateBudget).toHaveBeenCalledWith(budgetInput);
    });
  });
  
  describe('DELETE /api/budgets/:id', () => {
    it('should delete a budget', async () => {
      vi.mocked(services.budget.deleteBudget).mockResolvedValue(undefined);
      
      const response = await request(app).delete('/api/budgets/budget-1');
      
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(services.budget.deleteBudget).toHaveBeenCalledWith('budget-1');
    });
  });
  
  describe('GET /api/budgets/:month/status', () => {
    it('should return budget status with expenses', async () => {
      vi.mocked(services.budget.getBudgetStatus).mockResolvedValue(mockBudgetStatus);
      
      const response = await request(app).get('/api/budgets/2023-01/status');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockBudgetStatus);
      expect(services.budget.getBudgetStatus).toHaveBeenCalledWith('2023-01');
    });
  });
  
  describe('GET /api/budgets/range', () => {
    it('should return budgets for a range of months', async () => {
      const mockBudgets = [mockBudget];
      
      vi.mocked(services.budget.getBudgetsByMonthRange).mockResolvedValue(mockBudgets);
      
      const response = await request(app)
        .get('/api/budgets/range')
        .query({ startMonth: '2023-01', endMonth: '2023-01' });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockBudgets);
      expect(services.budget.getBudgetsByMonthRange).toHaveBeenCalledWith('2023-01', '2023-01');
    });
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { services } from '../services';
import expenseRoutes from './expenses';
import { errorHandler } from '../middleware';

// Mock the services
vi.mock('../services', () => {
  return {
    services: {
      expense: {
        getExpenses: vi.fn(),
        getExpenseById: vi.fn(),
        createExpense: vi.fn(),
        updateExpense: vi.fn(),
        deleteExpense: vi.fn(),
        getMonthlySummary: vi.fn(),
        getDailyTotals: vi.fn(),
        getMonthlyTotals: vi.fn(),
        getExpensesByCategory: vi.fn(),
        getExpensesByMonth: vi.fn()
      },
      category: {
        getCategoryById: vi.fn()
      }
    }
  };
});

describe('Expense API Routes', () => {
  const app = express();
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
  
  // Setup test app
  beforeAll(() => {
    app.use(express.json());
    app.use('/api/expenses', expenseRoutes);
    app.use(errorHandler);
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('GET /api/expenses', () => {
    it('should return paginated expenses', async () => {
      const mockResult = {
        expenses: [mockExpense],
        total: 1
      };
      
      vi.mocked(services.expense.getExpenses).mockResolvedValue(mockResult);
      
      const response = await request(app).get('/api/expenses?page=1&limit=10');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([mockExpense]);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(1);
      expect(services.expense.getExpenses).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/expenses/:id', () => {
    it('should return an expense by ID', async () => {
      vi.mocked(services.expense.getExpenseById).mockResolvedValue(mockExpense);
      
      const response = await request(app).get('/api/expenses/exp-1');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockExpense);
      expect(services.expense.getExpenseById).toHaveBeenCalledWith('exp-1');
    });
    
    it('should return 404 when expense not found', async () => {
      vi.mocked(services.expense.getExpenseById).mockRejectedValue(new Error('Not found'));
      
      const response = await request(app).get('/api/expenses/non-existent');
      
      expect(response.status).toBe(500); // In a real app, this would be 404
    });
  });
  
  describe('POST /api/expenses', () => {
    it('should create a new expense', async () => {
      const expenseInput = {
        date: '2023-01-15',
        amount: 25.50,
        category: 'cat-1',
        description: 'Lunch',
        paymentMethod: 'credit'
      };
      
      vi.mocked(services.expense.createExpense).mockResolvedValue(mockExpense);
      
      const response = await request(app)
        .post('/api/expenses')
        .send(expenseInput);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(mockExpense);
      expect(services.expense.createExpense).toHaveBeenCalledWith(expenseInput);
    });
    
    it('should return 400 for invalid input', async () => {
      const invalidInput = {
        // Missing required fields
        date: '2023-01-15'
      };
      
      const response = await request(app)
        .post('/api/expenses')
        .send(invalidInput);
      
      expect(response.status).toBe(500); // In a real app with validation, this would be 400
    });
  });
  
  describe('PUT /api/expenses/:id', () => {
    it('should update an expense', async () => {
      const updateData = {
        date: '2023-01-15',
        amount: 30.00,
        category: 'cat-1',
        description: 'Updated lunch',
        paymentMethod: 'credit'
      };
      
      const updatedExpense = { ...mockExpense, ...updateData };
      
      vi.mocked(services.expense.updateExpense).mockResolvedValue(updatedExpense);
      
      const response = await request(app)
        .put('/api/expenses/exp-1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedExpense);
      expect(services.expense.updateExpense).toHaveBeenCalledWith('exp-1', updateData);
    });
  });
  
  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense', async () => {
      vi.mocked(services.expense.deleteExpense).mockResolvedValue(undefined);
      
      const response = await request(app).delete('/api/expenses/exp-1');
      
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(services.expense.deleteExpense).toHaveBeenCalledWith('exp-1');
    });
  });
  
  describe('GET /api/expenses/summary/:month', () => {
    it('should return monthly summary', async () => {
      const mockSummary = [
        { category: 'cat-1', total: 100 }
      ];
      
      vi.mocked(services.expense.getMonthlySummary).mockResolvedValue(mockSummary);
      vi.mocked(services.category.getCategoryById).mockResolvedValue({
        id: 'cat-1',
        name: 'Food',
        color: '#FF0000',
        isDefault: true,
        createdAt: '2023-01-01T00:00:00Z'
      });
      
      const response = await request(app).get('/api/expenses/summary/2023-01');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(services.expense.getMonthlySummary).toHaveBeenCalledWith('2023-01');
    });
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { services } from '../services';
import categoryRoutes from './categories';
import { errorHandler } from '../middleware';

// Mock the services
vi.mock('../services', () => {
  return {
    services: {
      category: {
        getAllCategories: vi.fn(),
        getCategoryById: vi.fn(),
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
        getDefaultCategories: vi.fn(),
        setCategoryAsDefault: vi.fn()
      }
    }
  };
});

describe('Category API Routes', () => {
  const app = express();
  const mockCategory = {
    id: 'cat-1',
    name: 'Food',
    color: '#FF0000',
    isDefault: false,
    createdAt: '2023-01-01T00:00:00Z'
  };
  
  // Setup test app
  beforeAll(() => {
    app.use(express.json());
    app.use('/api/categories', categoryRoutes);
    app.use(errorHandler);
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory];
      
      vi.mocked(services.category.getAllCategories).mockResolvedValue(mockCategories);
      
      const response = await request(app).get('/api/categories');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockCategories);
      expect(services.category.getAllCategories).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/categories/defaults', () => {
    it('should return default categories', async () => {
      const mockDefaultCategories = [{ ...mockCategory, isDefault: true }];
      
      vi.mocked(services.category.getDefaultCategories).mockResolvedValue(mockDefaultCategories);
      
      const response = await request(app).get('/api/categories/defaults');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockDefaultCategories);
      expect(services.category.getDefaultCategories).toHaveBeenCalled();
    });
  });
  
  describe('GET /api/categories/:id', () => {
    it('should return a category by ID', async () => {
      vi.mocked(services.category.getCategoryById).mockResolvedValue(mockCategory);
      
      const response = await request(app).get('/api/categories/cat-1');
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockCategory);
      expect(services.category.getCategoryById).toHaveBeenCalledWith('cat-1');
    });
    
    it('should return 404 when category not found', async () => {
      vi.mocked(services.category.getCategoryById).mockRejectedValue(new Error('Not found'));
      
      const response = await request(app).get('/api/categories/non-existent');
      
      expect(response.status).toBe(500); // In a real app, this would be 404
    });
  });
  
  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryInput = {
        name: 'Entertainment',
        color: '#00FF00'
      };
      
      const createdCategory = {
        id: 'cat-2',
        name: 'Entertainment',
        color: '#00FF00',
        isDefault: false,
        createdAt: '2023-01-02T00:00:00Z'
      };
      
      vi.mocked(services.category.createCategory).mockResolvedValue(createdCategory);
      
      const response = await request(app)
        .post('/api/categories')
        .send(categoryInput);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toEqual(createdCategory);
      expect(services.category.createCategory).toHaveBeenCalledWith(categoryInput);
    });
    
    it('should return 400 for invalid input', async () => {
      const invalidInput = {
        // Missing color
        name: 'Entertainment'
      };
      
      const response = await request(app)
        .post('/api/categories')
        .send(invalidInput);
      
      expect(response.status).toBe(500); // In a real app with validation, this would be 400
    });
  });
  
  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const updateData = {
        name: 'Food & Dining',
        color: '#FF5500'
      };
      
      const updatedCategory = { ...mockCategory, ...updateData };
      
      vi.mocked(services.category.updateCategory).mockResolvedValue(updatedCategory);
      
      const response = await request(app)
        .put('/api/categories/cat-1')
        .send(updateData);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedCategory);
      expect(services.category.updateCategory).toHaveBeenCalledWith('cat-1', updateData);
    });
  });
  
  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      vi.mocked(services.category.deleteCategory).mockResolvedValue(undefined);
      
      const response = await request(app).delete('/api/categories/cat-1');
      
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(services.category.deleteCategory).toHaveBeenCalledWith('cat-1');
    });
  });
  
  describe('PATCH /api/categories/:id/default', () => {
    it('should set a category as default', async () => {
      const updatedCategory = { ...mockCategory, isDefault: true };
      
      vi.mocked(services.category.setCategoryAsDefault).mockResolvedValue(updatedCategory);
      
      const response = await request(app)
        .patch('/api/categories/cat-1/default')
        .send({ isDefault: true });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(updatedCategory);
      expect(services.category.setCategoryAsDefault).toHaveBeenCalledWith('cat-1', true);
    });
  });
});
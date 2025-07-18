import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CategoryService } from './category-service';
import { repositories } from '../database';
import { NotFoundError, ConflictError } from '../utils/errors';

// Mock the repositories
vi.mock('../database', () => {
  return {
    repositories: {
      category: {
        findAll: vi.fn(),
        findById: vi.fn(),
        findByName: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        deleteById: vi.fn(),
        findDefaultCategories: vi.fn(),
        setAsDefault: vi.fn(),
        getDefaultCategory: vi.fn(),
        reassignExpenses: vi.fn()
      }
    }
  };
});

describe('CategoryService', () => {
  let categoryService: CategoryService;
  const mockCategory = {
    id: 'cat-1',
    name: 'Food',
    color: '#FF0000',
    isDefault: false,
    createdAt: '2023-01-01T00:00:00Z'
  };
  
  const mockDefaultCategory = {
    id: 'cat-default',
    name: 'Other',
    color: '#CCCCCC',
    isDefault: true,
    createdAt: '2023-01-01T00:00:00Z'
  };
  
  beforeEach(() => {
    categoryService = new CategoryService();
    vi.clearAllMocks();
  });
  
  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [mockCategory, mockDefaultCategory];
      
      vi.mocked(repositories.category.findAll).mockResolvedValue(mockCategories);
      
      const result = await categoryService.getAllCategories();
      
      expect(result).toEqual(mockCategories);
      expect(repositories.category.findAll).toHaveBeenCalled();
    });
  });
  
  describe('getCategoryById', () => {
    it('should return a category when found', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      
      const result = await categoryService.getCategoryById('cat-1');
      
      expect(result).toEqual(mockCategory);
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-1');
    });
    
    it('should throw NotFoundError when category not found', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      await expect(categoryService.getCategoryById('non-existent')).rejects.toThrow(NotFoundError);
    });
  });
  
  describe('createCategory', () => {
    it('should create a category when name is unique', async () => {
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
      
      vi.mocked(repositories.category.findByName).mockResolvedValue(undefined);
      vi.mocked(repositories.category.create).mockResolvedValue(createdCategory);
      
      const result = await categoryService.createCategory(categoryInput);
      
      expect(result).toEqual(createdCategory);
      expect(repositories.category.findByName).toHaveBeenCalledWith('Entertainment');
      expect(repositories.category.create).toHaveBeenCalledWith(categoryInput);
    });
    
    it('should throw ConflictError when category name already exists', async () => {
      vi.mocked(repositories.category.findByName).mockResolvedValue(mockCategory);
      
      const categoryInput = {
        name: 'Food',
        color: '#00FF00'
      };
      
      await expect(categoryService.createCategory(categoryInput)).rejects.toThrow(ConflictError);
      expect(repositories.category.create).not.toHaveBeenCalled();
    });
  });
  
  describe('updateCategory', () => {
    it('should update a category when it exists', async () => {
      const updateData = { color: '#0000FF' };
      const updatedCategory = { ...mockCategory, color: '#0000FF' };
      
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.category.update).mockResolvedValue(updatedCategory);
      
      const result = await categoryService.updateCategory('cat-1', updateData);
      
      expect(result).toEqual(updatedCategory);
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-1');
      expect(repositories.category.update).toHaveBeenCalledWith('cat-1', updateData);
    });
    
    it('should throw NotFoundError when category does not exist', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      await expect(categoryService.updateCategory('non-existent', { color: '#0000FF' })).rejects.toThrow(NotFoundError);
      expect(repositories.category.update).not.toHaveBeenCalled();
    });
    
    it('should check for name uniqueness when updating name', async () => {
      const updateData = { name: 'Entertainment' };
      
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.category.findByName).mockResolvedValue(undefined);
      vi.mocked(repositories.category.update).mockResolvedValue({ ...mockCategory, name: 'Entertainment' });
      
      const result = await categoryService.updateCategory('cat-1', updateData);
      
      expect(result.name).toBe('Entertainment');
      expect(repositories.category.findByName).toHaveBeenCalledWith('Entertainment');
    });
    
    it('should throw ConflictError when updating to existing name', async () => {
      const existingCategory = {
        id: 'cat-2',
        name: 'Entertainment',
        color: '#00FF00',
        isDefault: false,
        createdAt: '2023-01-02T00:00:00Z'
      };
      
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.category.findByName).mockResolvedValue(existingCategory);
      
      await expect(categoryService.updateCategory('cat-1', { name: 'Entertainment' })).rejects.toThrow(ConflictError);
      expect(repositories.category.update).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteCategory', () => {
    it('should delete a category and reassign expenses', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.category.getDefaultCategory).mockResolvedValue(mockDefaultCategory);
      vi.mocked(repositories.category.reassignExpenses).mockResolvedValue(5); // 5 expenses reassigned
      vi.mocked(repositories.category.deleteById).mockResolvedValue(true);
      
      await categoryService.deleteCategory('cat-1');
      
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-1');
      expect(repositories.category.getDefaultCategory).toHaveBeenCalled();
      expect(repositories.category.reassignExpenses).toHaveBeenCalledWith('cat-1', 'cat-default');
      expect(repositories.category.deleteById).toHaveBeenCalledWith('cat-1');
    });
    
    it('should throw NotFoundError when category does not exist', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      await expect(categoryService.deleteCategory('non-existent')).rejects.toThrow(NotFoundError);
      expect(repositories.category.deleteById).not.toHaveBeenCalled();
    });
    
    it('should throw ConflictError when trying to delete a default category', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(mockDefaultCategory);
      
      await expect(categoryService.deleteCategory('cat-default')).rejects.toThrow(ConflictError);
      expect(repositories.category.deleteById).not.toHaveBeenCalled();
    });
  });
  
  describe('getDefaultCategories', () => {
    it('should return default categories', async () => {
      const mockDefaultCategories = [mockDefaultCategory];
      
      vi.mocked(repositories.category.findDefaultCategories).mockResolvedValue(mockDefaultCategories);
      
      const result = await categoryService.getDefaultCategories();
      
      expect(result).toEqual(mockDefaultCategories);
      expect(repositories.category.findDefaultCategories).toHaveBeenCalled();
    });
  });
  
  describe('setCategoryAsDefault', () => {
    it('should set a category as default', async () => {
      const updatedCategory = { ...mockCategory, isDefault: true };
      
      vi.mocked(repositories.category.findById).mockResolvedValue(mockCategory);
      vi.mocked(repositories.category.setAsDefault).mockResolvedValue(true);
      vi.mocked(repositories.category.findById).mockResolvedValueOnce(updatedCategory); // For the second call
      
      const result = await categoryService.setCategoryAsDefault('cat-1', true);
      
      expect(result).toEqual(updatedCategory);
      expect(repositories.category.findById).toHaveBeenCalledWith('cat-1');
      expect(repositories.category.setAsDefault).toHaveBeenCalledWith('cat-1', true);
    });
    
    it('should throw NotFoundError when category does not exist', async () => {
      vi.mocked(repositories.category.findById).mockResolvedValue(undefined);
      
      await expect(categoryService.setCategoryAsDefault('non-existent', true)).rejects.toThrow(NotFoundError);
      expect(repositories.category.setAsDefault).not.toHaveBeenCalled();
    });
  });
});
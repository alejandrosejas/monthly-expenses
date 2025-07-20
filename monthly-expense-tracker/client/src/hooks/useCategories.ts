import { useState, useCallback } from 'react';
import { Category, CategoryInput, ApiResponse } from 'shared';
import api from '../services/api';
import { useToast } from '../components/common/Toast';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  createCategory: (data: CategoryInput) => Promise<Category | null>;
  updateCategory: (id: string, data: CategoryInput) => Promise<Category | null>;
  deleteCategory: (id: string) => Promise<boolean>;
}

export const useCategories = (): UseCategoriesReturn => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      setCategories(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch categories';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const createCategory = useCallback(async (data: CategoryInput): Promise<Category | null> => {
    try {
      const response = await api.post<ApiResponse<Category>>('/categories', data);
      const newCategory = response.data;
      
      setCategories(prev => [...prev, newCategory]);
      addToast('Category created successfully', 'success');
      
      return newCategory;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create category';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [addToast]);

  const updateCategory = useCallback(async (id: string, data: CategoryInput): Promise<Category | null> => {
    try {
      const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
      const updatedCategory = response.data;
      
      setCategories(prev => 
        prev.map(cat => cat.id === id ? updatedCategory : cat)
      );
      addToast('Category updated successfully', 'success');
      
      return updatedCategory;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update category';
      addToast(errorMessage, 'error');
      return null;
    }
  }, [addToast]);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/categories/${id}`);
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      addToast('Category deleted successfully', 'success');
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete category';
      addToast(errorMessage, 'error');
      return false;
    }
  }, [addToast]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
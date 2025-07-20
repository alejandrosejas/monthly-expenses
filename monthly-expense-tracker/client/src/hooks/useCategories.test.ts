import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useCategories } from './useCategories';
import { ToastProvider } from '../components/common/Toast';
import { Category, CategoryInput } from 'shared';
import api from '../services/api';
import React from 'react';

// Mock the API
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock toast context
const mockAddToast = vi.fn();
vi.mock('../components/common/Toast', () => ({
  useToast: () => ({ addToast: mockAddToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Food',
    color: '#EF4444',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Transportation',
    color: '#3B82F6',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(ToastProvider, { children });

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddToast.mockClear();
  });

  it('initializes with empty state', () => {
    const { result } = renderHook(() => useCategories(), { wrapper });

    expect(result.current.categories).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('fetches categories successfully', async () => {
    const mockResponse = { data: mockCategories };
    (api.get as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCategories(), { wrapper });

    await act(async () => {
      await result.current.fetchCategories();
    });

    expect(api.get).toHaveBeenCalledWith('/categories');
    expect(result.current.categories).toEqual(mockCategories);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('creates category successfully', async () => {
    const newCategory: Category = {
      id: '3',
      name: 'Shopping',
      color: '#10B981',
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
    };
    const mockResponse = { data: newCategory };
    (api.post as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCategories(), { wrapper });

    const categoryInput: CategoryInput = {
      name: 'Shopping',
      color: '#10B981',
    };

    let createdCategory: Category | null = null;
    await act(async () => {
      createdCategory = await result.current.createCategory(categoryInput);
    });

    expect(api.post).toHaveBeenCalledWith('/categories', categoryInput);
    expect(createdCategory).toEqual(newCategory);
    expect(mockAddToast).toHaveBeenCalledWith('Category created successfully', 'success');
  });
});
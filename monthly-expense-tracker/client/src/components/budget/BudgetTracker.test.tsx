import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import BudgetTracker from './BudgetTracker';
import * as apiHooks from '../../hooks/useApi';

// Mock the API hooks
vi.mock('../../hooks/useApi', () => {
  return {
    useGet: vi.fn(),
    usePost: vi.fn(),
  };
});

describe('BudgetTracker', () => {
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

  const mockExecute = vi.fn();
  const mockSaveBudget = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    vi.mocked(apiHooks.useGet).mockImplementation((endpoint) => {
      if (endpoint.includes('/status')) {
        return {
          data: { data: mockBudgetStatus },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      } else {
        return {
          data: { data: mockBudget },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      }
    });
    
    vi.mocked(apiHooks.usePost).mockImplementation(() => {
      return {
        data: null,
        loading: false,
        error: null,
        execute: mockSaveBudget,
        reset: vi.fn(),
      };
    });
    
    mockExecute.mockResolvedValue({ data: mockBudget });
    mockSaveBudget.mockResolvedValue({ data: mockBudget });
  });

  it('should render loading state', () => {
    vi.mocked(apiHooks.useGet).mockImplementation(() => ({
      data: null,
      loading: true,
      error: null,
      execute: mockExecute,
      reset: vi.fn(),
    }));

    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should render error state', () => {
    vi.mocked(apiHooks.useGet).mockImplementation(() => ({
      data: null,
      loading: false,
      error: new Error('Failed to load'),
      execute: mockExecute,
      reset: vi.fn(),
    }));

    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    expect(screen.getByText('Error loading budget data')).toBeInTheDocument();
  });

  it('should render empty state when no budget is set', () => {
    vi.mocked(apiHooks.useGet).mockImplementation((endpoint) => {
      if (endpoint.includes('/status')) {
        return {
          data: { data: { ...mockBudgetStatus, totalBudget: 0 } },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      } else {
        return {
          data: { data: { ...mockBudget, totalBudget: 0 } },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      }
    });

    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    expect(screen.getByText('No budget set')).toBeInTheDocument();
    expect(screen.getByText('Set Budget')).toBeInTheDocument();
  });

  it('should render budget status when budget is set', () => {
    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    expect(screen.getByText(/Budget for January 2023/)).toBeInTheDocument();
    expect(screen.getByText('$1,000.00')).toBeInTheDocument(); // Total budget
    expect(screen.getByText('$350.00')).toBeInTheDocument(); // Total spent
    expect(screen.getByText('$650.00')).toBeInTheDocument(); // Remaining
    expect(screen.getByText('35% used')).toBeInTheDocument();
    
    // Check category budgets
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    fireEvent.click(screen.getByText('Edit'));
    
    expect(screen.getByText('Set Budget for January 2023')).toBeInTheDocument();
    expect(screen.getByLabelText('Total Budget')).toBeInTheDocument();
    expect(screen.getByText('Category Budgets')).toBeInTheDocument();
    expect(screen.getByText('Save Budget')).toBeInTheDocument();
  });

  it('should save budget when form is submitted', async () => {
    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Update total budget
    fireEvent.change(screen.getByLabelText('Total Budget'), { target: { value: '1500' } });
    
    // Update category budgets
    fireEvent.change(screen.getByLabelText('Food'), { target: { value: '700' } });
    fireEvent.change(screen.getByLabelText('Transportation'), { target: { value: '400' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Save Budget'));
    
    await waitFor(() => {
      expect(mockSaveBudget).toHaveBeenCalledWith({
        month: '2023-01',
        totalBudget: 1500,
        categoryBudgets: {
          'cat-1': 700,
          'cat-2': 400,
        },
      });
    });
    
    // Should fetch updated status after save
    expect(mockExecute).toHaveBeenCalled();
  });

  it('should render warning status for categories approaching budget limit', () => {
    vi.mocked(apiHooks.useGet).mockImplementation((endpoint) => {
      if (endpoint.includes('/status')) {
        return {
          data: { 
            data: {
              ...mockBudgetStatus,
              categories: [
                {
                  ...mockBudgetStatus.categories[0],
                  percentage: 85,
                  status: 'warning'
                },
                mockBudgetStatus.categories[1]
              ]
            }
          },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      } else {
        return {
          data: { data: mockBudget },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      }
    });

    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    expect(screen.getByText('Approaching budget limit')).toBeInTheDocument();
  });

  it('should render exceeded status for categories over budget', () => {
    vi.mocked(apiHooks.useGet).mockImplementation((endpoint) => {
      if (endpoint.includes('/status')) {
        return {
          data: { 
            data: {
              ...mockBudgetStatus,
              categories: [
                {
                  ...mockBudgetStatus.categories[0],
                  percentage: 110,
                  status: 'exceeded'
                },
                mockBudgetStatus.categories[1]
              ]
            }
          },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      } else {
        return {
          data: { data: mockBudget },
          loading: false,
          error: null,
          execute: mockExecute,
          reset: vi.fn(),
        };
      }
    });

    render(<BudgetTracker month="2023-01" categories={mockCategories} />);
    
    expect(screen.getByText('Budget exceeded')).toBeInTheDocument();
  });
});
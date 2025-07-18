import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExpenseList from './ExpenseList';
import { useGet } from '../../hooks/useApi';

// Mock the useGet hook
vi.mock('../../hooks/useApi', () => ({
  useGet: vi.fn(),
  useDelete: vi.fn().mockReturnValue({
    execute: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    data: null,
    reset: vi.fn(),
  }),
}));

// Mock the ExpenseItem component
vi.mock('./ExpenseItem', () => ({
  default: ({ expense, category, onEdit, onDelete }) => (
    <tr data-testid="expense-item">
      <td>{expense.date}</td>
      <td>${expense.amount}</td>
      <td>{category?.name || 'Uncategorized'}</td>
      <td>{expense.description}</td>
      <td>
        <button onClick={() => onEdit(expense)}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </td>
    </tr>
  ),
}));

describe('ExpenseList Component', () => {
  const mockMonth = '2023-01';
  const mockCategories = [
    {
      id: 'cat1',
      name: 'Groceries',
      color: '#FF5733',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'cat2',
      name: 'Entertainment',
      color: '#33FF57',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z',
    },
  ];
  
  const mockExpenses = [
    {
      id: 'exp1',
      date: '2023-01-15',
      amount: 42.99,
      category: 'cat1',
      description: 'Grocery shopping',
      paymentMethod: 'credit',
      createdAt: '2023-01-15T12:00:00Z',
      updatedAt: '2023-01-15T12:00:00Z',
    },
    {
      id: 'exp2',
      date: '2023-01-20',
      amount: 25.50,
      category: 'cat2',
      description: 'Movie tickets',
      paymentMethod: 'cash',
      createdAt: '2023-01-20T18:30:00Z',
      updatedAt: '2023-01-20T18:30:00Z',
    },
  ];

  const mockOnEditExpense = vi.fn();
  const mockOnExpenseDeleted = vi.fn();
  
  const mockFetchExpenses = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation for useGet
    (useGet as any).mockReturnValue({
      data: {
        data: mockExpenses,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      },
      loading: false,
      error: null,
      execute: mockFetchExpenses,
      reset: vi.fn(),
    });
  });

  it('renders expense list with data', () => {
    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Check if expense items are rendered
    expect(screen.getAllByTestId('expense-item').length).toBe(2);
    
    // Check if column headers are rendered
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useGet as any).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      execute: mockFetchExpenses,
      reset: vi.fn(),
    });

    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    expect(screen.getByText('Loading expenses...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    (useGet as any).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to load expenses'),
      execute: mockFetchExpenses,
      reset: vi.fn(),
    });

    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    expect(screen.getByText('Error loading expenses. Please try again.')).toBeInTheDocument();
  });

  it('shows empty state when no expenses', () => {
    (useGet as any).mockReturnValue({
      data: {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      },
      loading: false,
      error: null,
      execute: mockFetchExpenses,
      reset: vi.fn(),
    });

    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    expect(screen.getByText('No expenses found for this month.')).toBeInTheDocument();
  });

  it('handles search input', () => {
    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search expenses...');
    fireEvent.change(searchInput, { target: { value: 'grocery' } });
    
    // Should trigger a fetch with the search term
    expect(mockFetchExpenses).toHaveBeenCalled();
  });

  it('handles sort change', () => {
    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Click on Amount header to sort
    fireEvent.click(screen.getByText('Amount'));
    
    // Should trigger a fetch with the new sort
    expect(mockFetchExpenses).toHaveBeenCalled();
  });

  it('toggles filters visibility', () => {
    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Filters should be hidden initially
    expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
    
    // Click show filters button
    fireEvent.click(screen.getByText('Show Filters'));
    
    // Filters should be visible
    expect(screen.getByText('Advanced Filters')).toBeInTheDocument();
    
    // Click hide filters button
    fireEvent.click(screen.getByText('Hide Filters'));
    
    // Filters should be hidden again
    expect(screen.queryByText('Advanced Filters')).not.toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    render(
      <ExpenseList
        month={mockMonth}
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Add a search term
    const searchInput = screen.getByPlaceholderText('Search expenses...');
    fireEvent.change(searchInput, { target: { value: 'grocery' } });
    
    // Clear filters button should be visible
    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);
    
    // Search input should be cleared
    expect(searchInput).toHaveValue('');
    
    // Should trigger a fetch with cleared filters
    await waitFor(() => {
      expect(mockFetchExpenses).toHaveBeenCalledTimes(3); // Initial + search + clear
    });
  });
});
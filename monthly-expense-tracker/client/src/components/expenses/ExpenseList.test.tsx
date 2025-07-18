import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExpenseList from './ExpenseList';
import { Expense, Category, PaginatedResponse } from 'shared';

// Mock the useGet hook
vi.mock('../../hooks/useApi', () => ({
  useGet: () => ({
    data: {
      data: [
        {
          id: '1',
          date: '2023-05-15',
          amount: 42.99,
          category: 'food',
          description: 'Grocery shopping',
          paymentMethod: 'credit',
          createdAt: '2023-05-15T12:00:00Z',
          updatedAt: '2023-05-15T12:00:00Z',
        },
        {
          id: '2',
          date: '2023-05-10',
          amount: 25.50,
          category: 'entertainment',
          description: 'Movie tickets',
          paymentMethod: 'cash',
          createdAt: '2023-05-10T18:30:00Z',
          updatedAt: '2023-05-10T18:30:00Z',
        },
      ],
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    },
    loading: false,
    error: null,
    execute: vi.fn(),
  }),
}));

// Mock the components used by ExpenseList
vi.mock('./ExpenseItem', () => ({
  default: ({ expense, category, onEdit, onDelete, searchTerm }) => (
    <tr data-testid={`expense-item-${expense.id}`}>
      <td>{expense.date}</td>
      <td>${expense.amount.toFixed(2)}</td>
      <td>{category?.name || 'Unknown'}</td>
      <td>{expense.description}</td>
      <td>{expense.paymentMethod}</td>
      <td>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </td>
    </tr>
  ),
}));

vi.mock('./AdvancedFilters', () => ({
  default: ({ filters, categories, onFilterChange, onClearFilters }) => (
    <div data-testid="advanced-filters">
      <button 
        data-testid="apply-filters-button" 
        onClick={() => onFilterChange({
          ...filters,
          startDate: '2023-05-01',
          endDate: '2023-05-31',
        })}
      >
        Apply Filters
      </button>
      <button 
        data-testid="clear-filters-button" 
        onClick={onClearFilters}
      >
        Clear Filters
      </button>
    </div>
  ),
}));

vi.mock('../common/Button', () => ({
  default: ({ children, onClick, variant, size, disabled }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

describe('ExpenseList', () => {
  const mockCategories: Category[] = [
    {
      id: 'food',
      name: 'Food',
      color: '#FF5733',
      isDefault: true,
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      color: '#33FF57',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z',
    },
  ];

  const mockOnEditExpense = vi.fn();
  const mockOnExpenseDeleted = vi.fn();

  // Mock window.history.replaceState
  const mockReplaceState = vi.fn();
  Object.defineProperty(window, 'history', {
    writable: true,
    value: { replaceState: mockReplaceState },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders expense list with data', () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    expect(screen.getByTestId('expense-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('expense-item-2')).toBeInTheDocument();
  });

  it('shows and hides advanced filters', () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Advanced filters should not be visible initially
    expect(screen.queryByTestId('advanced-filters')).not.toBeInTheDocument();

    // Click Show Filters button
    fireEvent.click(screen.getByText('Show Filters'));

    // Advanced filters should now be visible
    expect(screen.getByTestId('advanced-filters')).toBeInTheDocument();

    // Click Hide Filters button
    fireEvent.click(screen.getByText('Hide Filters'));

    // Advanced filters should be hidden again
    expect(screen.queryByTestId('advanced-filters')).not.toBeInTheDocument();
  });

  it('updates URL when filters are applied', async () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Show advanced filters
    fireEvent.click(screen.getByText('Show Filters'));

    // Apply filters
    fireEvent.click(screen.getByTestId('apply-filters-button'));

    // Wait for URL update
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalled();
    });
  });

  it('clears filters and URL when Clear Filters is clicked', async () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Show advanced filters
    fireEvent.click(screen.getByText('Show Filters'));

    // Clear filters
    fireEvent.click(screen.getByTestId('clear-filters-button'));

    // Wait for URL update
    await waitFor(() => {
      expect(mockReplaceState).toHaveBeenCalledWith({}, '', window.location.pathname);
    });
  });

  it('handles search input', () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Find search input
    const searchInput = screen.getByPlaceholderText('Search expenses...');

    // Enter search term
    fireEvent.change(searchInput, { target: { value: 'grocery' } });

    // Check if URL is updated
    expect(mockReplaceState).toHaveBeenCalled();
  });

  it('handles sort changes', () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Click on Amount header to sort
    fireEvent.click(screen.getByText('Amount'));

    // Check if URL is updated
    expect(mockReplaceState).toHaveBeenCalled();

    // Click again to change sort direction
    fireEvent.click(screen.getByText('Amount'));

    // Check if URL is updated again
    expect(mockReplaceState).toHaveBeenCalledTimes(2);
  });

  it('handles pagination', () => {
    render(
      <ExpenseList
        month="2023-05"
        categories={mockCategories}
        onEditExpense={mockOnEditExpense}
        onExpenseDeleted={mockOnExpenseDeleted}
      />
    );

    // Click Next page button
    fireEvent.click(screen.getByText('Next'));

    // Check if URL is updated
    expect(mockReplaceState).toHaveBeenCalled();
  });
});
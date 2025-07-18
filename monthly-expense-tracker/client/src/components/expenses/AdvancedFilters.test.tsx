import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AdvancedFilters from './AdvancedFilters';
import { ExpenseFilters, Category } from 'shared';

describe('AdvancedFilters', () => {
  const mockCategories: Category[] = [
    {
      id: 'food',
      name: 'Food',
      color: '#FF5733',
      isDefault: true,
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'transport',
      name: 'Transportation',
      color: '#33FF57',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      color: '#3357FF',
      isDefault: false,
      createdAt: '2023-01-01T00:00:00Z',
    },
  ];

  const mockFilters: ExpenseFilters = {
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    minAmount: 10,
    maxAmount: 100,
    categories: ['food'],
    paymentMethods: ['cash', 'credit'],
    searchTerm: 'grocery',
  };

  const mockOnFilterChange = vi.fn();
  const mockOnClearFilters = vi.fn();

  it('renders all filter sections', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Date range
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('From:')).toBeInTheDocument();
    expect(screen.getByText('To:')).toBeInTheDocument();

    // Amount range
    expect(screen.getByText('Amount Range')).toBeInTheDocument();
    expect(screen.getByText('Min: $')).toBeInTheDocument();
    expect(screen.getByText('Max: $')).toBeInTheDocument();

    // Search
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search in description...')).toBeInTheDocument();

    // Payment methods
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Debit Card')).toBeInTheDocument();
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();

    // Categories
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();

    // Buttons
    expect(screen.getByText('Clear All')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });

  it('displays initial filter values correctly', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Date range
    expect(screen.getByDisplayValue('2023-05-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2023-05-31')).toBeInTheDocument();

    // Amount range
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();

    // Search term
    expect(screen.getByDisplayValue('grocery')).toBeInTheDocument();

    // Payment methods (checked)
    const cashCheckbox = screen.getByLabelText('Cash') as HTMLInputElement;
    const creditCheckbox = screen.getByLabelText('Credit Card') as HTMLInputElement;
    expect(cashCheckbox.checked).toBe(true);
    expect(creditCheckbox.checked).toBe(true);

    // Payment methods (unchecked)
    const debitCheckbox = screen.getByLabelText('Debit Card') as HTMLInputElement;
    const transferCheckbox = screen.getByLabelText('Bank Transfer') as HTMLInputElement;
    expect(debitCheckbox.checked).toBe(false);
    expect(transferCheckbox.checked).toBe(false);

    // Categories
    const foodCheckbox = screen.getByLabelText('Food') as HTMLInputElement;
    expect(foodCheckbox.checked).toBe(true);
  });

  it('calls onFilterChange when Apply Filters is clicked', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Change a filter value
    const minAmountInput = screen.getByDisplayValue('10');
    fireEvent.change(minAmountInput, { target: { value: '20' } });

    // Click Apply Filters
    fireEvent.click(screen.getByText('Apply Filters'));

    // Check if onFilterChange was called with updated filters
    expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      minAmount: 20,
    });
  });

  it('calls onClearFilters when Clear All is clicked', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Click Clear All
    fireEvent.click(screen.getByText('Clear All'));

    // Check if onClearFilters was called
    expect(mockOnClearFilters).toHaveBeenCalledTimes(1);
  });

  it('handles select all and deselect all for categories', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Click Select all for categories
    const selectAllCategoriesButtons = screen.getAllByText('Select all');
    fireEvent.click(selectAllCategoriesButtons[1]); // Categories select all

    // Click Apply Filters
    fireEvent.click(screen.getByText('Apply Filters'));

    // Check if onFilterChange was called with all categories selected
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: ['food', 'transport', 'entertainment'],
      })
    );

    // Reset mock
    mockOnFilterChange.mockClear();

    // Click Deselect all for categories
    const deselectAllCategoriesButtons = screen.getAllByText('Deselect all');
    fireEvent.click(deselectAllCategoriesButtons[1]); // Categories deselect all

    // Click Apply Filters
    fireEvent.click(screen.getByText('Apply Filters'));

    // Check if onFilterChange was called with no categories selected
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: [],
      })
    );
  });

  it('handles select all and deselect all for payment methods', () => {
    render(
      <AdvancedFilters
        filters={mockFilters}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Click Select all for payment methods
    const selectAllPaymentMethodsButtons = screen.getAllByText('Select all');
    fireEvent.click(selectAllPaymentMethodsButtons[0]); // Payment methods select all

    // Click Apply Filters
    fireEvent.click(screen.getByText('Apply Filters'));

    // Check if onFilterChange was called with all payment methods selected
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethods: ['cash', 'credit', 'debit', 'transfer'],
      })
    );

    // Reset mock
    mockOnFilterChange.mockClear();

    // Click Deselect all for payment methods
    const deselectAllPaymentMethodsButtons = screen.getAllByText('Deselect all');
    fireEvent.click(deselectAllPaymentMethodsButtons[0]); // Payment methods deselect all

    // Click Apply Filters
    fireEvent.click(screen.getByText('Apply Filters'));

    // Check if onFilterChange was called with no payment methods selected
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethods: [],
      })
    );
  });

  it('resets date range to current month', () => {
    render(
      <AdvancedFilters
        filters={{}}
        categories={mockCategories}
        onFilterChange={mockOnFilterChange}
        onClearFilters={mockOnClearFilters}
        month="2023-05"
      />
    );

    // Click Reset to current month
    fireEvent.click(screen.getByText('Reset to current month'));

    // Click Apply Filters
    fireEvent.click(screen.getByText('Apply Filters'));

    // Check if onFilterChange was called with the current month date range
    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: '2023-05-01',
        endDate: '2023-05-31',
      })
    );
  });
});
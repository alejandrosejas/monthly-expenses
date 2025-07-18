import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExpenseItem from './ExpenseItem';
import { Expense, Category } from 'shared';

// Mock the useDelete hook
vi.mock('../../hooks/useApi', () => ({
  useDelete: () => ({
    execute: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
  }),
}));

describe('ExpenseItem', () => {
  const mockExpense: Expense = {
    id: '123',
    date: '2023-05-15',
    amount: 42.99,
    category: 'food',
    description: 'Grocery shopping',
    paymentMethod: 'credit',
    createdAt: '2023-05-15T12:00:00Z',
    updatedAt: '2023-05-15T12:00:00Z',
  };

  const mockCategory: Category = {
    id: 'food',
    name: 'Food',
    color: '#FF5733',
    isDefault: true,
    createdAt: '2023-01-01T00:00:00Z',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders expense details correctly', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={mockExpense}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('$42.99')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Grocery shopping')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('highlights search term in description', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={mockExpense}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            searchTerm="grocery"
          />
        </tbody>
      </table>
    );

    const highlightedText = screen.getByText((content, element) => {
      return element?.textContent === 'Grocery shopping' && 
             element?.querySelector('.bg-yellow-200') !== null;
    });
    
    expect(highlightedText).toBeInTheDocument();
  });

  it('handles special characters in search term', () => {
    const expenseWithSpecialChars = {
      ...mockExpense,
      description: 'Cost: $50.00 (20% off)',
    };

    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={expenseWithSpecialChars}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            searchTerm="$50.00"
          />
        </tbody>
      </table>
    );

    const highlightedText = screen.getByText((content, element) => {
      return element?.textContent === 'Cost: $50.00 (20% off)' && 
             element?.querySelector('.bg-yellow-200') !== null;
    });
    
    expect(highlightedText).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={mockExpense}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByLabelText('Edit expense'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('shows delete confirmation when delete button is clicked', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={mockExpense}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByLabelText('Delete expense'));
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onDelete when delete is confirmed', async () => {
    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={mockExpense}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
          />
        </tbody>
      </table>
    );

    fireEvent.click(screen.getByLabelText('Delete expense'));
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });
});
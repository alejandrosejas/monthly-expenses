import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ExpenseItem from './ExpenseItem';
import { useDelete } from '../../hooks/useApi';

// Mock the useDelete hook
vi.mock('../../hooks/useApi', () => ({
  useDelete: vi.fn(),
}));

// Mock the date-utils
vi.mock('../../utils/date-utils', () => ({
  formatDate: (date: string) => date,
}));

describe('ExpenseItem Component', () => {
  const mockExpense = {
    id: '123',
    date: '2023-01-15',
    amount: 42.99,
    category: 'cat123',
    description: 'Test expense',
    paymentMethod: 'credit',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-01-15T12:00:00Z',
  };

  const mockCategory = {
    id: 'cat123',
    name: 'Groceries',
    color: '#FF5733',
    isDefault: false,
    createdAt: '2023-01-01T00:00:00Z',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementation for useDelete
    (useDelete as any).mockReturnValue({
      execute: vi.fn().mockResolvedValue({ success: true }),
      loading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    });
  });

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

    expect(screen.getByText('2023-01-15')).toBeInTheDocument();
    expect(screen.getByText('$42.99')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Test expense')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
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

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('shows confirmation dialog when delete button is clicked', () => {
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

    fireEvent.click(screen.getByText('Delete'));
    
    // Confirmation buttons should be visible
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('cancels delete when cancel button is clicked', () => {
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

    // Click delete to show confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));
    
    // Edit button should be visible again
    expect(screen.getByText('Edit')).toBeInTheDocument();
    
    // Delete API should not have been called
    const mockExecute = useDelete('').execute;
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('calls delete API when delete is confirmed', async () => {
    const mockExecute = vi.fn().mockResolvedValue({ success: true });
    (useDelete as any).mockReturnValue({
      execute: mockExecute,
      loading: false,
      error: null,
      data: null,
      reset: vi.fn(),
    });

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

    // Click delete to show confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Click delete confirmation
    fireEvent.click(screen.getByText('Delete'));
    
    // Delete API should have been called
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });
  });

  it('highlights search term in description and category', () => {
    render(
      <table>
        <tbody>
          <ExpenseItem
            expense={mockExpense}
            category={mockCategory}
            onEdit={mockOnEdit}
            onDelete={mockOnDelete}
            searchTerm="test"
          />
        </tbody>
      </table>
    );

    // The search term should be highlighted
    const highlightedText = screen.getByText('Test');
    expect(highlightedText.parentElement).toHaveClass('bg-yellow-200');
  });
});
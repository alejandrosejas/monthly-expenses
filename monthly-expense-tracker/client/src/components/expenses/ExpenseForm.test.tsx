import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseForm from './ExpenseForm';
import * as apiHooks from '../../hooks/useApi';

// Mock the shared types
const PaymentMethod = {
  CASH: 'cash',
  CREDIT: 'credit',
  DEBIT: 'debit',
  TRANSFER: 'transfer'
} as const;

// Mock Category type
interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
}

// Mock the API hooks
vi.mock('../../hooks/useApi', () => ({
  usePost: vi.fn(),
  usePut: vi.fn(),
}));

// Sample categories for testing
const mockCategories: Category[] = [
  {
    id: 'cat1',
    name: 'Food',
    color: '#FF5733',
    isDefault: true,
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'cat2',
    name: 'Transportation',
    color: '#33FF57',
    isDefault: false,
    createdAt: '2023-01-01T00:00:00.000Z',
  },
];

// Sample expense for testing
const mockExpense = {
  date: '2023-07-15',
  amount: 42.99,
  category: 'cat1',
  description: 'Lunch at restaurant',
  paymentMethod: PaymentMethod.CREDIT,
};

describe('ExpenseForm', () => {
  // Mock API hooks before each test
  beforeEach(() => {
    const mockExecute = vi.fn().mockResolvedValue({
      data: { ...mockExpense, id: 'expense-123' },
    });
    
    vi.mocked(apiHooks.usePost).mockReturnValue({
      execute: mockExecute,
      data: null,
      loading: false,
      error: null,
      reset: vi.fn(),
    });
    
    vi.mocked(apiHooks.usePut).mockReturnValue({
      execute: mockExecute,
      data: null,
      loading: false,
      error: null,
      reset: vi.fn(),
    });
  });

  it('renders the form with default values for new expense', () => {
    render(<ExpenseForm categories={mockCategories} />);
    
    // Check if the form title is correct
    expect(screen.getByText('Add New Expense')).toBeInTheDocument();
    
    // Check if the submit button is present
    expect(screen.getByRole('button', { name: 'Add Expense' })).toBeInTheDocument();
    
    // Check if all form fields are present
    expect(screen.getByLabelText('Date')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Method')).toBeInTheDocument();
  });

  it('renders the form with existing expense values for editing', () => {
    render(
      <ExpenseForm 
        expense={{ ...mockExpense, id: 'expense-123' }} 
        categories={mockCategories} 
      />
    );
    
    // Check if the form title is correct
    expect(screen.getByText('Edit Expense')).toBeInTheDocument();
    
    // Check if the submit button is correct
    expect(screen.getByRole('button', { name: 'Update Expense' })).toBeInTheDocument();
    
    // Check if form fields have the correct values
    expect(screen.getByLabelText('Date')).toHaveValue(mockExpense.date);
    expect(screen.getByLabelText('Amount')).toHaveValue(mockExpense.amount);
    expect(screen.getByLabelText('Description')).toHaveValue(mockExpense.description);
    
    // Check select fields
    const categorySelect = screen.getByLabelText('Category') as HTMLSelectElement;
    expect(categorySelect.value).toBe(mockExpense.category);
    
    const paymentMethodSelect = screen.getByLabelText('Payment Method') as HTMLSelectElement;
    expect(paymentMethodSelect.value).toBe(mockExpense.paymentMethod);
  });

  it('shows validation errors for invalid inputs', async () => {
    render(<ExpenseForm categories={mockCategories} />);
    
    // Clear required fields
    await userEvent.clear(screen.getByLabelText('Description'));
    await userEvent.clear(screen.getByLabelText('Amount'));
    await userEvent.type(screen.getByLabelText('Amount'), '-10');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    
    // Check for validation error messages
    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    });
  });

  it('calls onSuccess callback when form is submitted successfully', async () => {
    const onSuccessMock = vi.fn();
    const mockExecute = vi.fn().mockResolvedValue({
      data: { ...mockExpense, id: 'expense-123' },
    });
    
    vi.mocked(apiHooks.usePost).mockReturnValue({
      execute: mockExecute,
      data: null,
      loading: false,
      error: null,
      reset: vi.fn(),
    });
    
    render(
      <ExpenseForm 
        categories={mockCategories} 
        onSuccess={onSuccessMock} 
      />
    );
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText('Description'), 'Test expense');
    await userEvent.clear(screen.getByLabelText('Amount'));
    await userEvent.type(screen.getByLabelText('Amount'), '50');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    
    // Check if the API was called and onSuccess callback was triggered
    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalled();
      expect(onSuccessMock).toHaveBeenCalledWith({ ...mockExpense, id: 'expense-123' });
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancelMock = vi.fn();
    
    render(
      <ExpenseForm 
        categories={mockCategories} 
        onCancel={onCancelMock} 
      />
    );
    
    // Click the cancel button
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    
    // Check if onCancel was called
    expect(onCancelMock).toHaveBeenCalled();
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('API error occurred');
    const mockExecute = vi.fn().mockRejectedValue(mockError);
    
    vi.mocked(apiHooks.usePost).mockReturnValue({
      execute: mockExecute,
      data: null,
      loading: false,
      error: null,
      reset: vi.fn(),
    });
    
    render(<ExpenseForm categories={mockCategories} />);
    
    // Fill in the form
    await userEvent.type(screen.getByLabelText('Description'), 'Test expense');
    await userEvent.clear(screen.getByLabelText('Amount'));
    await userEvent.type(screen.getByLabelText('Amount'), '50');
    
    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: 'Add Expense' }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('API error occurred')).toBeInTheDocument();
    });
  });
});
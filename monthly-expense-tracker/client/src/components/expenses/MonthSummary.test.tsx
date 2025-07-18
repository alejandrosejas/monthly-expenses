import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MonthSummary from './MonthSummary';
import { useGet } from '../../hooks/useApi';
import { ExportButton } from '../common';

// Mock the useGet hook
jest.mock('../../hooks/useApi', () => ({
  useGet: jest.fn(),
}));

// Mock the ExportButton component
jest.mock('../common', () => ({
  ExportButton: jest.fn(() => <button data-testid="export-button">Export</button>),
}));

describe('MonthSummary', () => {
  const mockMonth = '2023-05';
  const mockCategories = [
    { id: 'cat-1', name: 'Food', color: '#FF5733', isDefault: true, createdAt: '2023-01-01T00:00:00.000Z' },
    { id: 'cat-2', name: 'Transport', color: '#33FF57', isDefault: true, createdAt: '2023-01-01T00:00:00.000Z' },
  ];

  const mockSummaryData = {
    data: {
      totalExpenses: 1250.75,
      categoryBreakdown: [
        { category: 'cat-1', amount: 750.50, percentage: 60 },
        { category: 'cat-2', amount: 500.25, percentage: 40 },
      ],
      dailyTotals: [
        { date: '2023-05-15', total: 500.25 },
        { date: '2023-05-20', total: 750.50 },
      ],
    },
  };

  const mockExecute = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useGet as jest.Mock).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      execute: mockExecute,
    });

    render(<MonthSummary month={mockMonth} categories={mockCategories} />);
    
    expect(mockExecute).toHaveBeenCalled();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useGet as jest.Mock).mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch'),
      execute: mockExecute,
    });

    render(<MonthSummary month={mockMonth} categories={mockCategories} />);
    
    expect(mockExecute).toHaveBeenCalled();
    expect(screen.getByText('Error loading summary')).toBeInTheDocument();
  });

  it('renders empty state when no expenses', () => {
    (useGet as jest.Mock).mockReturnValue({
      data: { data: { totalExpenses: 0, categoryBreakdown: [], dailyTotals: [] } },
      loading: false,
      error: null,
      execute: mockExecute,
    });

    render(<MonthSummary month={mockMonth} categories={mockCategories} />);
    
    expect(mockExecute).toHaveBeenCalled();
    expect(screen.getByText('No expenses')).toBeInTheDocument();
    expect(screen.getByText("You haven't added any expenses for this month yet.")).toBeInTheDocument();
    
    // Check that export button is disabled
    expect(ExportButton).toHaveBeenCalledWith(
      expect.objectContaining({
        month: mockMonth,
        disabled: true
      }),
      expect.anything()
    );
  });

  it('renders summary data correctly', async () => {
    (useGet as jest.Mock).mockReturnValue({
      data: mockSummaryData,
      loading: false,
      error: null,
      execute: mockExecute,
    });

    render(<MonthSummary month={mockMonth} categories={mockCategories} />);
    
    expect(mockExecute).toHaveBeenCalled();
    
    await waitFor(() => {
      // Check for export button
      expect(screen.getByTestId('export-button')).toBeInTheDocument();
      expect(ExportButton).toHaveBeenCalledWith(
        expect.objectContaining({
          month: mockMonth,
          disabled: false
        }),
        expect.anything()
      );
      
      // Check for monthly summary title
      expect(screen.getByText('Monthly Summary')).toBeInTheDocument();
      
      // Check for total expenses
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('$1,250.75')).toBeInTheDocument();
      
      // Check for top category
      expect(screen.getByText('Top Category')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('$750.50 (60%)')).toBeInTheDocument();
      
      // Check for average daily expense
      expect(screen.getByText('Average Daily Expense')).toBeInTheDocument();
      expect(screen.getByText('$625.38')).toBeInTheDocument();
      
      // Check for category breakdown
      expect(screen.getByText('Category Breakdown')).toBeInTheDocument();
      expect(screen.getAllByText('Food')[0]).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
      
      // Check for daily breakdown
      expect(screen.getByText('Daily Breakdown')).toBeInTheDocument();
    });
  });

  it('fetches new data when month changes', () => {
    const { rerender } = render(<MonthSummary month={mockMonth} categories={mockCategories} />);
    
    expect(mockExecute).toHaveBeenCalledTimes(1);
    
    // Change the month prop
    rerender(<MonthSummary month="2023-06" categories={mockCategories} />);
    
    // Should fetch data again
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});
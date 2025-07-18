import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ExpenseChart from './ExpenseChart';
import * as apiHooks from '../../hooks/useApi';

// Mock the Chart.js component
vi.mock('react-chartjs-2', () => ({
  Pie: () => <div data-testid="mock-pie-chart">Pie Chart</div>
}));

// Mock the useGet hook
vi.mock('../../hooks/useApi', () => ({
  useGet: vi.fn()
}));

describe('ExpenseChart', () => {
  const mockMonth = '2023-03';
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should render loading state', () => {
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      execute: vi.fn(),
      reset: vi.fn()
    });
    
    render(<ExpenseChart month={mockMonth} />);
    
    // Should show loading state
    expect(screen.getByTestId('mock-pie-chart')).not.toBeInTheDocument();
  });
  
  it('should render error state', () => {
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch data'),
      execute: vi.fn(),
      reset: vi.fn()
    });
    
    render(<ExpenseChart month={mockMonth} />);
    
    // Should show error message
    expect(screen.getByText(/Error loading chart data/)).toBeInTheDocument();
  });
  
  it('should render empty state when no data', () => {
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: { data: [] },
      loading: false,
      error: null,
      execute: vi.fn(),
      reset: vi.fn()
    });
    
    render(<ExpenseChart month={mockMonth} />);
    
    // Should show empty state message
    expect(screen.getByText(/No expense data available/)).toBeInTheDocument();
  });
  
  it('should render chart when data is available', async () => {
    const mockData = {
      data: [
        { category: 'Food', amount: 250, percentage: 50, color: '#FF5733' },
        { category: 'Transport', amount: 150, percentage: 30, color: '#33FF57' },
        { category: 'Entertainment', amount: 100, percentage: 20, color: '#3357FF' }
      ]
    };
    
    const mockExecute = vi.fn().mockResolvedValue(mockData);
    
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      execute: mockExecute,
      reset: vi.fn()
    });
    
    render(<ExpenseChart month={mockMonth} />);
    
    // Should call execute on mount
    expect(mockExecute).toHaveBeenCalled();
    
    // Should render chart
    await waitFor(() => {
      expect(screen.getByText('Expense Breakdown by Category')).toBeInTheDocument();
      expect(screen.getByTestId('mock-pie-chart')).toBeInTheDocument();
    });
    
    // Should render table with data
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });
  
  it('should fetch new data when month changes', () => {
    const mockExecute = vi.fn();
    
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      execute: mockExecute,
      reset: vi.fn()
    });
    
    const { rerender } = render(<ExpenseChart month={mockMonth} />);
    
    // Should call execute on mount
    expect(mockExecute).toHaveBeenCalledTimes(1);
    
    // Change month prop
    rerender(<ExpenseChart month="2023-04" />);
    
    // Should call execute again with new month
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
});
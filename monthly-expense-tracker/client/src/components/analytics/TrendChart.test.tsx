import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TrendChart from './TrendChart';
import * as apiHooks from '../../hooks/useApi';

// Mock the Chart.js component
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-line-chart">Line Chart</div>
}));

// Mock the useGet hook
vi.mock('../../hooks/useApi', () => ({
  useGet: vi.fn()
}));

describe('TrendChart', () => {
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
    
    render(<TrendChart month={mockMonth} />);
    
    // Should show loading state
    expect(screen.queryByTestId('mock-line-chart')).not.toBeInTheDocument();
  });
  
  it('should render error state', () => {
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Failed to fetch data'),
      execute: vi.fn(),
      reset: vi.fn()
    });
    
    render(<TrendChart month={mockMonth} />);
    
    // Should show error message
    expect(screen.getByText(/Error loading trend data/)).toBeInTheDocument();
  });
  
  it('should render empty state when no data', () => {
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: { data: [] },
      loading: false,
      error: null,
      execute: vi.fn(),
      reset: vi.fn()
    });
    
    render(<TrendChart month={mockMonth} />);
    
    // Should show empty state message
    expect(screen.getByText(/No trend data available/)).toBeInTheDocument();
  });
  
  it('should render chart when data is available', async () => {
    const mockData = {
      data: [
        { month: '2023-01', total: 400 },
        { month: '2023-02', total: 500 },
        { month: '2023-03', total: 600 }
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
    
    render(<TrendChart month={mockMonth} />);
    
    // Should call execute on mount
    expect(mockExecute).toHaveBeenCalled();
    
    // Should render chart
    await waitFor(() => {
      expect(screen.getByText('Expense Trends')).toBeInTheDocument();
      expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    });
    
    // Should render table with data
    expect(screen.getByText('Month')).toBeInTheDocument();
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Change')).toBeInTheDocument();
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
    
    const { rerender } = render(<TrendChart month={mockMonth} />);
    
    // Should call execute on mount
    expect(mockExecute).toHaveBeenCalledTimes(1);
    
    // Change month prop
    rerender(<TrendChart month="2023-04" />);
    
    // Should call execute again with new month
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });
  
  it('should pass custom months count to API', () => {
    const mockExecute = vi.fn();
    
    vi.spyOn(apiHooks, 'useGet').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      execute: mockExecute,
      reset: vi.fn()
    });
    
    render(<TrendChart month={mockMonth} months={12} />);
    
    // Should call useGet with correct endpoint including months count
    expect(apiHooks.useGet).toHaveBeenCalledWith(`/api/analytics/monthly-totals/${mockMonth}?count=12`);
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MonthComparison from './MonthComparison';
import * as useApiModule from '../../hooks/useApi';

// Mock the useApi hook
vi.mock('../../hooks/useApi');

// Mock date utils
vi.mock('../../utils/date-utils', () => ({
  formatMonthYear: (month: string) => {
    const [year, monthNum] = month.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(monthNum) - 1]} ${year}`;
  }
}));

const mockUseGet = vi.mocked(useApiModule.useGet);

describe('MonthComparison', () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGet.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      execute: mockExecute
    });
  });

  it('renders loading state', () => {
    mockUseGet.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      execute: mockExecute
    });

    render(<MonthComparison currentMonth="2024-02" previousMonth="2024-01" />);
    
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const mockError = new Error('Failed to fetch');
    mockUseGet.mockReturnValue({
      data: null,
      loading: false,
      error: mockError,
      execute: mockExecute
    });

    render(<MonthComparison currentMonth="2024-02" previousMonth="2024-01" />);
    
    expect(screen.getByText(/Error loading comparison data/)).toBeInTheDocument();
    expect(screen.getByText(/Failed to fetch/)).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    mockUseGet.mockReturnValue({
      data: { data: [] },
      loading: false,
      error: null,
      execute: mockExecute
    });

    render(<MonthComparison currentMonth="2024-02" previousMonth="2024-01" />);
    
    expect(screen.getByText('No comparison data available')).toBeInTheDocument();
  });

  it('renders comparison data correctly', async () => {
    const mockData = {
      data: [
        {
          category: 'Food',
          currentMonth: { month: '2024-02', amount: 500 },
          previousMonth: { month: '2024-01', amount: 400 },
          difference: 100,
          percentageChange: 25
        },
        {
          category: 'Transportation',
          currentMonth: { month: '2024-02', amount: 200 },
          previousMonth: { month: '2024-01', amount: 300 },
          difference: -100,
          percentageChange: -33.3
        }
      ]
    };

    mockUseGet.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      execute: mockExecute
    });

    render(<MonthComparison currentMonth="2024-02" previousMonth="2024-01" />);
    
    // Check header
    expect(screen.getByText('Month Comparison: Feb 2024 vs Jan 2024')).toBeInTheDocument();
    
    // Check overall totals using getAllByText for duplicate amounts
    const totals = screen.getAllByText('$700.00');
    expect(totals).toHaveLength(2); // Current and previous totals
    expect(screen.getByText('$0.00')).toBeInTheDocument(); // Total difference
    
    // Check category data
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$400.00')).toBeInTheDocument();
    expect(screen.getByText('+$100.00')).toBeInTheDocument();
    expect(screen.getByText('+25.0%')).toBeInTheDocument();
    expect(screen.getByText('$-100.00')).toBeInTheDocument(); // Note: format is $-100.00, not -$100.00
    expect(screen.getByText('-33.3%')).toBeInTheDocument();
  });

  it('displays key insights correctly', () => {
    const mockData = {
      data: [
        {
          category: 'Food',
          currentMonth: { month: '2024-02', amount: 500 },
          previousMonth: { month: '2024-01', amount: 400 },
          difference: 100,
          percentageChange: 25
        },
        {
          category: 'Transportation',
          currentMonth: { month: '2024-02', amount: 200 },
          previousMonth: { month: '2024-01', amount: 300 },
          difference: -100,
          percentageChange: -33.3
        },
        {
          category: 'Entertainment',
          currentMonth: { month: '2024-02', amount: 150 },
          previousMonth: { month: '2024-01', amount: 0 },
          difference: 150,
          percentageChange: 100
        }
      ]
    };

    mockUseGet.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      execute: mockExecute
    });

    render(<MonthComparison currentMonth="2024-02" previousMonth="2024-01" />);
    
    // Check insights section
    expect(screen.getByText('Key Insights')).toBeInTheDocument();
    expect(screen.getByText(/Biggest increase: Entertainment/)).toBeInTheDocument();
    expect(screen.getByText(/Biggest decrease: Transportation/)).toBeInTheDocument();
    expect(screen.getByText(/New spending categories: Entertainment/)).toBeInTheDocument();
  });

  it('calls execute when months change', () => {
    const { rerender } = render(
      <MonthComparison currentMonth="2024-02" previousMonth="2024-01" />
    );
    
    expect(mockExecute).toHaveBeenCalledTimes(1);
    
    rerender(<MonthComparison currentMonth="2024-03" previousMonth="2024-02" />);
    
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it('applies correct styling for positive and negative changes', () => {
    const mockData = {
      data: [
        {
          category: 'Food',
          currentMonth: { month: '2024-02', amount: 500 },
          previousMonth: { month: '2024-01', amount: 400 },
          difference: 100,
          percentageChange: 25
        },
        {
          category: 'Transportation',
          currentMonth: { month: '2024-02', amount: 200 },
          previousMonth: { month: '2024-01', amount: 300 },
          difference: -100,
          percentageChange: -33.3
        }
      ]
    };

    mockUseGet.mockReturnValue({
      data: mockData,
      loading: false,
      error: null,
      execute: mockExecute
    });

    render(<MonthComparison currentMonth="2024-02" previousMonth="2024-01" />);
    
    // Check that positive changes have red styling (increase in spending is bad)
    const positiveChange = screen.getByText('+$100.00');
    expect(positiveChange).toHaveClass('text-red-600');
    
    // Check that negative changes have green styling (decrease in spending is good)
    const negativeChange = screen.getByText('$-100.00'); // Note: format is $-100.00, not -$100.00
    expect(negativeChange).toHaveClass('text-green-600');
  });
});
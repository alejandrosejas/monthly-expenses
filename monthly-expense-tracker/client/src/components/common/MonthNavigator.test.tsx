import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MonthNavigator from './MonthNavigator';
import { formatMonthYear, getPreviousMonth, getNextMonth } from '../../utils/date-utils';

// Mock date-utils functions
jest.mock('../../utils/date-utils', () => ({
  formatMonthYear: jest.fn(),
  getPreviousMonth: jest.fn(),
  getNextMonth: jest.fn(),
}));

describe('MonthNavigator', () => {
  const mockCurrentMonth = '2023-05';
  const mockPrevMonth = '2023-04';
  const mockNextMonth = '2023-06';
  const mockOnMonthChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (formatMonthYear as jest.Mock).mockReturnValue('May 2023');
    (getPreviousMonth as jest.Mock).mockReturnValue(mockPrevMonth);
    (getNextMonth as jest.Mock).mockReturnValue(mockNextMonth);
  });

  it('renders correctly with current month', () => {
    render(
      <MonthNavigator 
        currentMonth={mockCurrentMonth} 
        onMonthChange={mockOnMonthChange} 
      />
    );

    expect(formatMonthYear).toHaveBeenCalledWith(mockCurrentMonth);
    expect(screen.getByText('May 2023')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
    expect(screen.getByLabelText('Next month')).toBeInTheDocument();
  });

  it('calls onMonthChange with previous month when previous button is clicked', () => {
    render(
      <MonthNavigator 
        currentMonth={mockCurrentMonth} 
        onMonthChange={mockOnMonthChange} 
      />
    );

    fireEvent.click(screen.getByLabelText('Previous month'));
    
    expect(getPreviousMonth).toHaveBeenCalledWith(mockCurrentMonth);
    expect(mockOnMonthChange).toHaveBeenCalledWith(mockPrevMonth);
  });

  it('calls onMonthChange with next month when next button is clicked', () => {
    render(
      <MonthNavigator 
        currentMonth={mockCurrentMonth} 
        onMonthChange={mockOnMonthChange} 
      />
    );

    fireEvent.click(screen.getByLabelText('Next month'));
    
    expect(getNextMonth).toHaveBeenCalledWith(mockCurrentMonth);
    expect(mockOnMonthChange).toHaveBeenCalledWith(mockNextMonth);
  });
});
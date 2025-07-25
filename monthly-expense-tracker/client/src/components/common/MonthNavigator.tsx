import React from 'react';
import { formatMonthYear, getPreviousMonth, getNextMonth } from '../../utils/date-utils';

interface MonthNavigatorProps {
  currentMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthNavigator: React.FC<MonthNavigatorProps> = ({ currentMonth, onMonthChange }) => {
  const handlePreviousMonth = () => {
    onMonthChange(getPreviousMonth(currentMonth));
  };
  
  const handleNextMonth = () => {
    onMonthChange(getNextMonth(currentMonth));
  };
  
  return (
    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <button
        onClick={handlePreviousMonth}
        className="p-2 sm:p-3 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
        aria-label="Previous month"
        data-testid="prev-month-button"
      >
        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>
      <span className="px-3 py-2 text-gray-700 dark:text-gray-300 font-medium min-w-[100px] text-center">
        {formatMonthYear(currentMonth)}
      </span>
      <button
        onClick={handleNextMonth}
        className="p-2 sm:p-3 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
        aria-label="Next month"
        data-testid="next-month-button"
      >
        <svg className="h-5 w-5 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default MonthNavigator;
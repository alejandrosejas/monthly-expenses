import { useState } from 'react';
import ExpenseChart from '../components/analytics/ExpenseChart';
import TrendChart from '../components/analytics/TrendChart';
import MonthComparison from '../components/analytics/MonthComparison';
import MonthNavigator from '../components/common/MonthNavigator';
import { getCurrentMonth } from '../utils/date-utils';

const Analytics = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  // Calculate previous month for comparison
  const previousMonth = (() => {
    const date = new Date(`${currentMonth}-01`);
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().substring(0, 7); // YYYY-MM format
  })();
  
  return (
    <div className="space-y-6" data-testid="analytics-section">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Analyze your spending patterns and trends
            </p>
          </div>
          <MonthNavigator 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth} 
          />
        </div>
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart month={currentMonth} />
        <TrendChart month={currentMonth} />
      </div>
      
      {/* Month-over-Month Comparison */}
      <MonthComparison 
        currentMonth={currentMonth} 
        previousMonth={previousMonth} 
      />
      
      {/* Insights */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
          How to Use Analytics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Category Breakdown</h4>
            <p>See where your money goes each month with visual category breakdowns and percentages.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Spending Trends</h4>
            <p>Track your spending patterns over time with trend analysis and month-over-month changes.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Month Comparison</h4>
            <p>Compare current month spending with previous months to identify changes and patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
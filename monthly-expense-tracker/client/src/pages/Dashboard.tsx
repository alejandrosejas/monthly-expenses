import { useState } from 'react';
import MonthNavigator from '../components/common/MonthNavigator';
import MonthSummary from '../components/expenses/MonthSummary';
import Button from '../components/common/Button';
import { useExpenseState } from '../hooks/useExpenseState';
import { getCurrentMonth } from '../utils/date-utils';

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  const {
    categories,
    loading,
    errors,
    refreshCategories,
  } = useExpenseState({ month: currentMonth });
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6" data-testid="dashboard-section">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        </div>
        <MonthNavigator 
          currentMonth={currentMonth} 
          onMonthChange={setCurrentMonth} 
        />
      </div>
      
      {loading.categories ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : errors.categories ? (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading categories</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{errors.categories}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={refreshCategories}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MonthSummary 
          month={currentMonth}
          categories={categories}
        />
      )}
    </div>
  );
};

export default Dashboard;
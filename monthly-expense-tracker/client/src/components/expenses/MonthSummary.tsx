import React, { useEffect } from 'react';
import { useGet } from '../../hooks/useApi';
import { Category, CategoryBreakdown } from 'shared';
import { ExportButton } from '../common';

interface MonthSummaryProps {
  month: string;
  categories: Category[];
}

interface MonthlySummaryResponse {
  data: {
    totalExpenses: number;
    categoryBreakdown: CategoryBreakdown[];
    dailyTotals: { date: string; total: number }[];
  };
}

const MonthSummary: React.FC<MonthSummaryProps> = ({ month, categories }) => {
  const {
    data: summaryResponse,
    loading: loadingSummary,
    error: summaryError,
    execute: fetchSummary,
  } = useGet<MonthlySummaryResponse>(`/api/expenses/summary/${month}`);

  useEffect(() => {
    fetchSummary();
  }, [month]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Get category color
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280'; // Default gray if category not found
  };

  // Empty state
  if (!loadingSummary && !summaryError && (!summaryResponse?.data?.totalExpenses || summaryResponse.data.totalExpenses === 0)) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No expenses</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You haven't added any expenses for this month yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadingSummary ? (
        <div className="animate-pulse space-y-4" data-testid="loading-skeleton">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : summaryError ? (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading summary</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Unable to load expense summary. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Summary</h2>
            <ExportButton 
              month={month} 
              disabled={!summaryResponse?.data?.totalExpenses || summaryResponse.data.totalExpenses === 0}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total expenses card */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Expenses</h3>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white" data-testid="monthly-total">
                {formatCurrency(summaryResponse?.data?.totalExpenses || 0)}
              </p>
            </div>
            
            {/* Top category card */}
            {summaryResponse?.data?.categoryBreakdown && summaryResponse.data.categoryBreakdown.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Category</h3>
                <div className="mt-1 flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: getCategoryColor(summaryResponse.data.categoryBreakdown[0].category) }}
                  ></div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {categories.find(c => c.id === summaryResponse.data.categoryBreakdown[0].category)?.name || 'Unknown'}
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formatCurrency(summaryResponse.data.categoryBreakdown[0].amount)} 
                  ({Math.round(summaryResponse.data.categoryBreakdown[0].percentage)}%)
                </p>
              </div>
            )}
            
            {/* Average daily expense card */}
            {summaryResponse?.data?.dailyTotals && summaryResponse.data.dailyTotals.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Daily Expense</h3>
                <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(
                    summaryResponse.data.totalExpenses / 
                    (summaryResponse.data.dailyTotals.filter(day => day.total > 0).length || 1)
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          {summaryResponse?.data?.categoryBreakdown && summaryResponse.data.categoryBreakdown.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {summaryResponse.data.categoryBreakdown.map(item => {
                  const category = categories.find(c => c.id === item.category);
                  return (
                    <div key={item.category} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: getCategoryColor(item.category) }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category?.name || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400" data-testid={`${category?.name?.toLowerCase()}-total`}>
                            {formatCurrency(item.amount)} ({Math.round(item.percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${item.percentage}%`,
                              backgroundColor: getCategoryColor(item.category)
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Daily breakdown */}
          {summaryResponse?.data?.dailyTotals && summaryResponse.data.dailyTotals.length > 0 && (
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Daily Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {summaryResponse.data.dailyTotals
                      .filter(day => day.total > 0)
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(day => (
                        <tr key={day.date}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {new Date(day.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                            {formatCurrency(day.total)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthSummary;
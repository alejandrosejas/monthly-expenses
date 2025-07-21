import { useState, useEffect } from 'react';
import { MonthComparison as MonthComparisonType } from 'shared';
import { useGet } from '../../hooks/useApi';
import { formatMonthYear } from '../../utils/date-utils';

interface MonthComparisonProps {
  currentMonth: string;
  previousMonth: string;
}

const MonthComparison: React.FC<MonthComparisonProps> = ({ 
  currentMonth, 
  previousMonth 
}) => {
  // Fetch comparison data
  const { 
    data: comparisonResponse, 
    loading, 
    error, 
    execute: fetchComparison 
  } = useGet<{ data: MonthComparisonType[] }>(`/api/analytics/compare/${currentMonth}/${previousMonth}`);

  // Fetch data when months change
  useEffect(() => {
    fetchComparison();
  }, [currentMonth, previousMonth, fetchComparison]);

  if (loading) {
    return (
      <div data-testid="loading-skeleton" className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Error loading comparison data: {error.message}
        </p>
      </div>
    );
  }

  const comparisons = comparisonResponse?.data || [];

  if (comparisons.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">
          No comparison data available
        </p>
      </div>
    );
  }

  // Calculate totals for both months
  const currentTotal = comparisons.reduce((sum, item) => sum + item.currentMonth.amount, 0);
  const previousTotal = comparisons.reduce((sum, item) => sum + item.previousMonth.amount, 0);
  const totalDifference = currentTotal - previousTotal;
  const totalPercentageChange = previousTotal > 0 ? (totalDifference / previousTotal) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
        Month Comparison: {formatMonthYear(currentMonth)} vs {formatMonthYear(previousMonth)}
      </h3>
      
      {/* Overall Summary */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {formatMonthYear(currentMonth)}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              ${currentTotal.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {formatMonthYear(previousMonth)}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              ${previousTotal.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Change
            </p>
            <p className={`text-xl font-semibold ${
              totalDifference > 0 
                ? 'text-red-600 dark:text-red-400' 
                : totalDifference < 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {totalDifference > 0 ? '+' : ''}${totalDifference.toFixed(2)}
            </p>
            <p className={`text-sm ${
              totalPercentageChange > 0 
                ? 'text-red-600 dark:text-red-400' 
                : totalPercentageChange < 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              ({totalPercentageChange > 0 ? '+' : ''}{totalPercentageChange.toFixed(1)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-2 text-gray-600 dark:text-gray-300">Category</th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-300">
                {formatMonthYear(currentMonth)}
              </th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-300">
                {formatMonthYear(previousMonth)}
              </th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-300">Difference</th>
              <th className="text-right py-2 px-2 text-gray-600 dark:text-gray-300">Change %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {comparisons.map((comparison) => (
              <tr key={comparison.category}>
                <td className="py-3 px-2 text-gray-800 dark:text-gray-200 font-medium">
                  {comparison.category}
                </td>
                <td className="text-right py-3 px-2 text-gray-800 dark:text-gray-200">
                  ${comparison.currentMonth.amount.toFixed(2)}
                </td>
                <td className="text-right py-3 px-2 text-gray-800 dark:text-gray-200">
                  ${comparison.previousMonth.amount.toFixed(2)}
                </td>
                <td className={`text-right py-3 px-2 ${
                  comparison.difference > 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : comparison.difference < 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {comparison.difference > 0 ? '+' : ''}${comparison.difference.toFixed(2)}
                </td>
                <td className={`text-right py-3 px-2 ${
                  comparison.percentageChange > 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : comparison.percentageChange < 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {comparison.percentageChange > 0 ? '+' : ''}{comparison.percentageChange.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Key Insights
        </h4>
        <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
          {/* Biggest increase */}
          {(() => {
            const biggestIncrease = comparisons
              .filter(c => c.difference > 0)
              .sort((a, b) => b.difference - a.difference)[0];
            
            if (biggestIncrease) {
              return (
                <p>
                  • Biggest increase: {biggestIncrease.category} (+${biggestIncrease.difference.toFixed(2)})
                </p>
              );
            }
            return null;
          })()}
          
          {/* Biggest decrease */}
          {(() => {
            const biggestDecrease = comparisons
              .filter(c => c.difference < 0)
              .sort((a, b) => a.difference - b.difference)[0];
            
            if (biggestDecrease) {
              return (
                <p>
                  • Biggest decrease: {biggestDecrease.category} (${biggestDecrease.difference.toFixed(2)})
                </p>
              );
            }
            return null;
          })()}
          
          {/* New categories */}
          {(() => {
            const newCategories = comparisons.filter(c => c.previousMonth.amount === 0 && c.currentMonth.amount > 0);
            if (newCategories.length > 0) {
              return (
                <p>
                  • New spending categories: {newCategories.map(c => c.category).join(', ')}
                </p>
              );
            }
            return null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default MonthComparison;
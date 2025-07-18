import { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { CategoryBreakdown } from 'shared';
import { useGet } from '../../hooks/useApi';
import { formatMonthYear } from '../../utils/date-utils';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ExpenseChartProps {
  month: string;
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ month }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  } | null>(null);

  // Fetch category breakdown data
  const { 
    data: breakdownResponse, 
    loading, 
    error, 
    execute: fetchBreakdown 
  } = useGet<{ data: CategoryBreakdown[] }>(`/api/analytics/category-breakdown/${month}`);

  // Fetch data when month changes
  useEffect(() => {
    fetchBreakdown();
  }, [month, fetchBreakdown]);

  // Process data for chart when breakdown data changes
  useEffect(() => {
    if (breakdownResponse?.data) {
      const breakdown = breakdownResponse.data;
      
      // Sort by amount descending
      const sortedBreakdown = [...breakdown].sort((a, b) => b.amount - a.amount);
      
      // Prepare chart data
      setChartData({
        labels: sortedBreakdown.map(item => item.category),
        datasets: [
          {
            data: sortedBreakdown.map(item => item.amount),
            backgroundColor: sortedBreakdown.map(item => item.color),
            borderColor: sortedBreakdown.map(item => item.color),
            borderWidth: 1,
          },
        ],
      });
    }
  }, [breakdownResponse]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Error loading chart data: {error.message}
        </p>
      </div>
    );
  }

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">
          No expense data available for {formatMonthYear(month)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
        Expense Breakdown by Category
      </h3>
      <div className="h-64">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                  font: {
                    size: 12
                  },
                  boxWidth: 15
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || '';
                    const value = context.raw as number;
                    const percentage = breakdownResponse?.data.find(
                      item => item.category === label
                    )?.percentage.toFixed(1);
                    return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                  }
                }
              }
            }
          }}
        />
      </div>
      <div className="mt-4">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-600 dark:text-gray-300">Category</th>
              <th className="text-right text-gray-600 dark:text-gray-300">Amount</th>
              <th className="text-right text-gray-600 dark:text-gray-300">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {breakdownResponse?.data.map((item) => (
              <tr key={item.category}>
                <td className="py-1">
                  <div className="flex items-center">
                    <span 
                      className="inline-block w-3 h-3 mr-2 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-gray-800 dark:text-gray-200">{item.category}</span>
                  </div>
                </td>
                <td className="text-right text-gray-800 dark:text-gray-200">
                  ${item.amount.toFixed(2)}
                </td>
                <td className="text-right text-gray-800 dark:text-gray-200">
                  {item.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseChart;
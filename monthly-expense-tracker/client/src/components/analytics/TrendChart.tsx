import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { MonthlyTotal } from 'shared';
import { useGet } from '../../hooks/useApi';
import { formatMonthYear } from '../../utils/date-utils';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TrendChartProps {
  month: string;
  months?: number;
}

const TrendChart: React.FC<TrendChartProps> = ({ month, months = 6 }) => {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
      tension: number;
    }[];
  } | null>(null);

  // Fetch monthly totals data
  const { 
    data: totalsResponse, 
    loading, 
    error, 
    execute: fetchTotals 
  } = useGet<{ data: MonthlyTotal[] }>(`/api/analytics/monthly-totals/${month}?count=${months}`);

  // Fetch data when month or months count changes
  useEffect(() => {
    fetchTotals();
  }, [month, months, fetchTotals]);

  // Process data for chart when totals data changes
  useEffect(() => {
    if (totalsResponse?.data) {
      const totals = totalsResponse.data;
      
      // Format month labels and prepare data
      setChartData({
        labels: totals.map(item => formatMonthYear(item.month)),
        datasets: [
          {
            label: 'Monthly Expenses',
            data: totals.map(item => item.total),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            tension: 0.2,
          },
        ],
      });
    }
  }, [totalsResponse]);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Error loading trend data: {error.message}
        </p>
      </div>
    );
  }

  if (!chartData || chartData.labels.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center">
        <p className="text-gray-600 dark:text-gray-300">
          No trend data available
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
        Expense Trends
      </h3>
      <div className="h-64 md:h-72">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                  callback: (value) => `${value}`,
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12
                  }
                },
                grid: {
                  color: document.documentElement.classList.contains('dark') 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                ticks: {
                  color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                  font: {
                    size: window.innerWidth < 768 ? 10 : 12
                  },
                  maxRotation: window.innerWidth < 768 ? 45 : 0
                },
                grid: {
                  color: document.documentElement.classList.contains('dark') 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.raw as number;
                    return `Total: ${value.toFixed(2)}`;
                  }
                }
              }
            }
          }}
        />
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-gray-600 dark:text-gray-300 px-2">Month</th>
              <th className="text-right text-gray-600 dark:text-gray-300 px-2">Total Expenses</th>
              <th className="text-right text-gray-600 dark:text-gray-300 px-2">Change</th>
              <th className="text-right text-gray-600 dark:text-gray-300 px-2">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {totalsResponse?.data.map((item, index, array) => {
              const prevTotal = index > 0 ? array[index - 1].total : null;
              const change = prevTotal !== null ? item.total - prevTotal : null;
              const changePercent = prevTotal && prevTotal !== 0 
                ? (change! / prevTotal) * 100 
                : null;
              
              // Calculate trend indicator
              const getTrendIndicator = () => {
                if (change === null) return '—';
                if (Math.abs(change) < 10) return '→'; // Stable (less than $10 change)
                return change > 0 ? '↗' : '↘'; // Up or down trend
              };
              
              const getTrendColor = () => {
                if (change === null || Math.abs(change) < 10) return 'text-gray-500 dark:text-gray-400';
                return change > 0 ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
              };
              
              return (
                <tr key={item.month}>
                  <td className="py-2 px-2 text-gray-800 dark:text-gray-200">
                    {formatMonthYear(item.month)}
                  </td>
                  <td className="text-right text-gray-800 dark:text-gray-200 py-2 px-2">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="text-right py-2 px-2">
                    {change !== null ? (
                      <span className={`
                        ${change > 0 ? 'text-red-600 dark:text-red-400' : 
                          change < 0 ? 'text-green-600 dark:text-green-400' : 
                          'text-gray-600 dark:text-gray-400'}
                      `}>
                        {change > 0 ? '+' : ''}${change.toFixed(2)} 
                        <span className="hidden sm:inline">
                          ({changePercent !== null ? (
                            <>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</>
                          ) : '-%'})
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">—</span>
                    )}
                  </td>
                  <td className={`text-right py-2 px-2 text-lg ${getTrendColor()}`}>
                    {getTrendIndicator()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Trend Analysis Summary */}
      {totalsResponse?.data && totalsResponse.data.length > 1 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Trend Analysis
          </h4>
          <div className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
            {(() => {
              const data = totalsResponse.data;
              const recentMonths = data.slice(-3); // Last 3 months
              const avgSpending = data.reduce((sum, item) => sum + item.total, 0) / data.length;
              const currentMonth = data[data.length - 1];
              const previousMonth = data[data.length - 2];
              
              // Calculate trend direction over last 3 months
              const isIncreasingTrend = recentMonths.length >= 2 && 
                recentMonths[recentMonths.length - 1].total > recentMonths[0].total;
              
              const monthlyChanges = data.slice(1).map((item, index) => 
                item.total - data[index].total
              );
              const avgMonthlyChange = monthlyChanges.length > 0 
                ? monthlyChanges.reduce((sum, change) => sum + change, 0) / monthlyChanges.length 
                : 0;
              
              return (
                <>
                  <p>
                    • Average monthly spending: ${avgSpending.toFixed(2)}
                  </p>
                  <p>
                    • Current month vs average: {currentMonth.total > avgSpending ? '+' : ''}
                    ${(currentMonth.total - avgSpending).toFixed(2)} 
                    ({((currentMonth.total - avgSpending) / avgSpending * 100).toFixed(1)}%)
                  </p>
                  <p>
                    • 3-month trend: {isIncreasingTrend ? 'Increasing' : 'Decreasing'} spending pattern
                  </p>
                  <p>
                    • Average monthly change: {avgMonthlyChange > 0 ? '+' : ''}${avgMonthlyChange.toFixed(2)}
                  </p>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendChart;
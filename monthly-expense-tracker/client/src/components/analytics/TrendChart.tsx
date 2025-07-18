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
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {totalsResponse?.data.map((item, index, array) => {
              const prevTotal = index > 0 ? array[index - 1].total : null;
              const change = prevTotal !== null ? item.total - prevTotal : null;
              const changePercent = prevTotal && prevTotal !== 0 
                ? (change! / prevTotal) * 100 
                : null;
              
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
                        {change > 0 ? '+' : ''}{change.toFixed(2)} 
                        <span className="hidden sm:inline">
                          ({changePercent !== null ? (
                            <>{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</>
                          ) : '-%'})
                        </span>
                      </span>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrendChart;
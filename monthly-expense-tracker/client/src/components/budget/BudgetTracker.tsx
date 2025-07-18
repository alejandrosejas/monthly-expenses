import React, { useEffect, useState } from 'react';
import { useGet, usePost } from '../../hooks/useApi';
import { Budget, BudgetInput, Category } from 'shared';
import { ApiResponse } from 'shared';

interface BudgetTrackerProps {
  month: string;
  categories: Category[];
}

interface BudgetStatusResponse {
  month: string;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  percentageUsed: number;
  categories: Array<{
    categoryId: string;
    categoryName: string;
    budgeted: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: 'normal' | 'warning' | 'exceeded';
  }>;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ month, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>({});

  // Fetch budget status
  const {
    data: budgetStatusResponse,
    loading: loadingStatus,
    error: statusError,
    execute: fetchBudgetStatus,
  } = useGet<ApiResponse<BudgetStatusResponse>>(`/api/budgets/${month}/status`);

  // Fetch budget data
  const {
    data: budgetResponse,
    loading: loadingBudget,
    error: budgetError,
    execute: fetchBudget,
  } = useGet<ApiResponse<Budget>>(`/api/budgets/${month}`);

  // Save budget
  const {
    loading: savingBudget,
    error: saveError,
    execute: saveBudget,
  } = usePost<ApiResponse<Budget>, BudgetInput>('/api/budgets', {
    month,
    totalBudget: 0,
    categoryBudgets: {},
  });

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Load data when month changes
  useEffect(() => {
    fetchBudgetStatus();
    fetchBudget();
  }, [month]);

  // Update form state when budget data is loaded
  useEffect(() => {
    if (budgetResponse?.data) {
      setTotalBudget(budgetResponse.data.totalBudget);
      setCategoryBudgets(budgetResponse.data.categoryBudgets);
    }
  }, [budgetResponse]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await saveBudget({
      month,
      totalBudget,
      categoryBudgets,
    });
    
    if (result) {
      setIsEditing(false);
      fetchBudgetStatus();
    }
  };

  // Handle category budget change
  const handleCategoryBudgetChange = (categoryId: string, value: number) => {
    setCategoryBudgets(prev => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  // Get status color
  const getStatusColor = (status: 'normal' | 'warning' | 'exceeded'): string => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get status text color
  const getStatusTextColor = (status: 'normal' | 'warning' | 'exceeded'): string => {
    switch (status) {
      case 'normal':
        return 'text-green-700';
      case 'warning':
        return 'text-yellow-700';
      case 'exceeded':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  // Loading state
  if (loadingStatus || loadingBudget) {
    return (
      <div className="animate-pulse space-y-4" data-testid="loading-skeleton">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (statusError || budgetError) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading budget data</h3>
            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
              <p>Unable to load budget information. Please try again.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No budget set yet
  if (!budgetStatusResponse?.data?.totalBudget && !isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No budget set</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You haven't set a budget for this month yet.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Set Budget
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Set Budget for {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        
        {saveError && (
          <div className="mb-4 bg-red-50 dark:bg-red-900 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error saving budget</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>Unable to save budget information. Please try again.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="totalBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Budget
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="totalBudget"
                  id="totalBudget"
                  min="0"
                  step="0.01"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0.00"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category Budgets</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <div key={category.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center sm:w-1/3">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <label htmlFor={`category-${category.id}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {category.name}
                      </label>
                    </div>
                    <div className="relative rounded-md shadow-sm flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name={`category-${category.id}`}
                        id={`category-${category.id}`}
                        min="0"
                        step="0.01"
                        value={categoryBudgets[category.id] || 0}
                        onChange={(e) => handleCategoryBudgetChange(category.id, parseFloat(e.target.value) || 0)}
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white h-10 sm:h-auto text-base sm:text-sm touch-manipulation"
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 touch-manipulation"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingBudget}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 touch-manipulation"
              >
                {savingBudget ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }

  // Display budget status
  const budgetStatus = budgetStatusResponse?.data;
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Budget for {new Date(month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Edit
        </button>
      </div>
      
      {/* Overall budget status */}
      <div className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 sm:mb-1">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</span>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(budgetStatus?.totalBudget || 0)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Spent</span>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatCurrency(budgetStatus?.totalSpent || 0)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining</span>
            <p className={`text-xl font-semibold ${budgetStatus?.totalRemaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {formatCurrency(budgetStatus?.totalRemaining || 0)}
            </p>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 sm:h-3">
          <div 
            className={`h-4 sm:h-3 rounded-full ${
              budgetStatus?.percentageUsed >= 100 
                ? 'bg-red-500' 
                : budgetStatus?.percentageUsed >= 80 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, budgetStatus?.percentageUsed || 0)}%` }}
          ></div>
        </div>
        
        <div className="mt-2 sm:mt-1 text-right">
          <span className={`text-sm font-medium ${
            budgetStatus?.percentageUsed >= 100 
              ? 'text-red-600 dark:text-red-400' 
              : budgetStatus?.percentageUsed >= 80 
                ? 'text-yellow-600 dark:text-yellow-400' 
                : 'text-green-600 dark:text-green-400'
          }`}>
            {budgetStatus?.percentageUsed || 0}% used
          </span>
        </div>
      </div>
      
      {/* Category budgets */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Category Budgets</h3>
        <div className="space-y-4">
          {budgetStatus?.categories.map(category => (
            <div key={category.categoryId} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: categories.find(c => c.id === category.categoryId)?.color || '#6B7280' }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.categoryName}</span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-medium ${getStatusTextColor(category.status)}`}>
                    {formatCurrency(category.spent)} of {formatCurrency(category.budgeted)} ({category.percentage}%)
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getStatusColor(category.status)}`}
                  style={{ width: `${Math.min(100, category.percentage)}%` }}
                ></div>
              </div>
              
              {category.status === 'warning' && (
                <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Approaching budget limit
                </div>
              )}
              
              {category.status === 'exceeded' && (
                <div className="flex items-center text-xs text-red-600 dark:text-red-400">
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Budget exceeded
                </div>
              )}
            </div>
          ))}
          
          {budgetStatus?.categories.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No category budgets set.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;
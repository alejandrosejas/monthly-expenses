import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, Category, ExpenseFilters, PaginatedResponse } from 'shared';
import { useExpenseState } from '../../hooks/useExpenseState';
import { formatDate, getMonthStart, getMonthEnd } from '../../utils/date-utils';
import ExpenseItem from './ExpenseItem';
import Button from '../common/Button';
import { SkeletonTable } from '../common/Skeleton';
import AdvancedFilters from './AdvancedFilters';

interface ExpenseListProps {
  month: string;
  categories: Category[];
  onEditExpense: (expense: Expense) => void;
  onExpenseDeleted: () => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  month,
  categories,
  onEditExpense,
  onExpenseDeleted,
}) => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ExpenseFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // State for URL parameters
  const [urlParams, setUrlParams] = useState<URLSearchParams | null>(null);

  // Initialize URL parameters
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setUrlParams(params);
      
      // Load filters from URL parameters
      const urlFilters: ExpenseFilters = {};
      
      // Search term
      const search = params.get('search');
      if (search) {
        setSearchTerm(search);
        urlFilters.searchTerm = search;
      }
      
      // Sort
      const sort = params.get('sort');
      if (sort && ['date', 'amount', 'category'].includes(sort)) {
        setSortField(sort as 'date' | 'amount' | 'category');
      }
      
      // Direction
      const direction = params.get('direction');
      if (direction && ['asc', 'desc'].includes(direction)) {
        setSortDirection(direction as 'asc' | 'desc');
      }
      
      // Page
      const page = params.get('page');
      if (page && !isNaN(parseInt(page))) {
        setCurrentPage(parseInt(page));
      }
      
      // Categories
      const categories = params.get('categories');
      if (categories) {
        const categoryIds = categories.split(',');
        setSelectedCategories(categoryIds);
        urlFilters.categories = categoryIds;
      }
      
      // Min amount
      const minAmount = params.get('minAmount');
      if (minAmount && !isNaN(parseFloat(minAmount))) {
        urlFilters.minAmount = parseFloat(minAmount);
      }
      
      // Max amount
      const maxAmount = params.get('maxAmount');
      if (maxAmount && !isNaN(parseFloat(maxAmount))) {
        urlFilters.maxAmount = parseFloat(maxAmount);
      }
      
      // Payment methods
      const paymentMethods = params.get('paymentMethods');
      if (paymentMethods) {
        urlFilters.paymentMethods = paymentMethods.split(',');
      }
      
      // Date range
      const startDate = params.get('startDate');
      if (startDate) {
        urlFilters.startDate = startDate;
      }
      
      const endDate = params.get('endDate');
      if (endDate) {
        urlFilters.endDate = endDate;
      }
      
      // Set filters from URL
      if (Object.keys(urlFilters).length > 0) {
        setFilters(urlFilters);
        setShowFilters(true);
      }
    }
  }, []);
  
  // Update URL with current filters
  const updateUrlParams = useCallback(() => {
    if (typeof window !== 'undefined' && urlParams) {
      // Create a new URLSearchParams object
      const params = new URLSearchParams();
      
      // Add current filters to URL
      if (searchTerm) {
        params.set('search', searchTerm);
      }
      
      if (sortField !== 'date') {
        params.set('sort', sortField);
      }
      
      if (sortDirection !== 'desc') {
        params.set('direction', sortDirection);
      }
      
      if (currentPage > 1) {
        params.set('page', currentPage.toString());
      }
      
      if (selectedCategories.length > 0) {
        params.set('categories', selectedCategories.join(','));
      }
      
      if (filters.minAmount) {
        params.set('minAmount', filters.minAmount.toString());
      }
      
      if (filters.maxAmount) {
        params.set('maxAmount', filters.maxAmount.toString());
      }
      
      if (filters.paymentMethods && filters.paymentMethods.length > 0) {
        params.set('paymentMethods', filters.paymentMethods.join(','));
      }
      
      if (filters.startDate) {
        params.set('startDate', filters.startDate);
      }
      
      if (filters.endDate) {
        params.set('endDate', filters.endDate);
      }
      
      // Update browser URL without reloading the page
      const newUrl = params.toString() 
        ? `${window.location.pathname}?${params.toString()}`
        : window.location.pathname;
      
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchTerm, sortField, sortDirection, currentPage, selectedCategories, filters, urlParams]);
  
  // Get expense state management
  const {
    expenses: allExpenses,
    loading,
    errors,
    deleteExpense,
  } = useExpenseState({ month });

  // Filter and sort expenses locally
  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...allExpenses];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchLower) ||
        expense.amount.toString().includes(searchLower) ||
        categories.find(c => c.id === expense.category)?.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(expense => selectedCategories.includes(expense.category));
    }

    // Apply amount filters
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(expense => expense.amount <= filters.maxAmount!);
    }

    // Apply payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      filtered = filtered.filter(expense => filters.paymentMethods!.includes(expense.paymentMethod));
    }

    // Apply date range filter
    if (filters.startDate) {
      filtered = filtered.filter(expense => expense.date >= filters.startDate!);
    }
    if (filters.endDate) {
      filtered = filtered.filter(expense => expense.date <= filters.endDate!);
    }

    // Sort expenses
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          const categoryA = categories.find(c => c.id === a.category)?.name || '';
          const categoryB = categories.find(c => c.id === b.category)?.name || '';
          comparison = categoryA.localeCompare(categoryB);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allExpenses, searchTerm, selectedCategories, filters, sortField, sortDirection, categories]);

  // Paginate expenses
  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedExpenses.slice(startIndex, endIndex);
  }, [filteredAndSortedExpenses, currentPage, itemsPerPage]);

  // Create mock response for compatibility
  const expensesResponse = useMemo(() => ({
    data: paginatedExpenses,
    pagination: {
      total: filteredAndSortedExpenses.length,
      totalPages: Math.ceil(filteredAndSortedExpenses.length / itemsPerPage),
      currentPage,
      limit: itemsPerPage,
    },
  }), [paginatedExpenses, filteredAndSortedExpenses.length, currentPage, itemsPerPage]);

  const loadingExpenses = loading.expenses;
  const expensesError = errors.expenses;

  // Update URL params when filters change
  useEffect(() => {
    updateUrlParams();
  }, [searchTerm, sortField, sortDirection, currentPage, selectedCategories, filters, updateUrlParams]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category filter change
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle sort change
  const handleSortChange = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page on sort change
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const paymentMethod = name.replace('payment_', '');
      
      setFilters(prev => {
        const paymentMethods = prev.paymentMethods || [];
        
        if (checkbox.checked) {
          return {
            ...prev,
            paymentMethods: [...paymentMethods, paymentMethod],
          };
        } else {
          return {
            ...prev,
            paymentMethods: paymentMethods.filter(method => method !== paymentMethod),
          };
        }
      });
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value === '' ? undefined : type === 'number' ? parseFloat(value) : value,
      }));
    }
    
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Handle advanced filter changes
  const handleAdvancedFilterChange = (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
    
    // Update selected categories if they've changed
    if (newFilters.categories && JSON.stringify(newFilters.categories) !== JSON.stringify(selectedCategories)) {
      setSelectedCategories(newFilters.categories);
    }
    
    // Update search term if it's changed
    if (newFilters.searchTerm !== searchTerm) {
      setSearchTerm(newFilters.searchTerm || '');
    }
    
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setFilters({});
    setSortField('date');
    setSortDirection('desc');
    setCurrentPage(1);
    
    // Clear URL parameters
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Calculate pagination
  const totalPages = expensesResponse?.pagination?.totalPages || 1;
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={handleSearchChange}
            data-testid="search-input"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {(searchTerm || selectedCategories.length > 0 || Object.keys(filters).length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <AdvancedFilters
          filters={filters}
          categories={categories}
          onFilterChange={handleAdvancedFilterChange}
          onClearFilters={clearFilters}
          month={month}
        />
      )}

      {/* Expenses table - Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'date' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('amount')}
              >
                <div className="flex items-center">
                  Amount
                  {sortField === 'amount' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortField === 'category' && (
                    <span className="ml-1">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Payment Method
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" data-testid="expense-list">
            {loadingExpenses ? (
              <tr>
                <td colSpan={6} className="px-6 py-4">
                  <SkeletonTable rows={5} columns={5} />
                </td>
              </tr>
            ) : expensesError ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-red-500">
                  Error loading expenses. Please try again.
                </td>
              </tr>
            ) : expensesResponse?.data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400" data-testid="empty-state">
                  No expenses found for this month.
                  {(searchTerm || selectedCategories.length > 0 || Object.keys(filters).length > 0) && (
                    <span> Try clearing your filters.</span>
                  )}
                </td>
              </tr>
            ) : (
              expensesResponse?.data?.map(expense => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  category={categories.find(c => c.id === expense.category)}
                  onEdit={() => onEditExpense(expense)}
                  onDelete={onExpenseDeleted}
                  searchTerm={searchTerm}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Mobile view for expenses */}
      <div className="md:hidden">
        {loadingExpenses ? (
          <div className="space-y-4 py-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div className="w-1/3">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="w-1/4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : expensesError ? (
          <div className="text-center py-4 text-red-500">
            Error loading expenses. Please try again.
          </div>
        ) : expensesResponse?.data?.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No expenses found for this month.
            {(searchTerm || selectedCategories.length > 0 || Object.keys(filters).length > 0) && (
              <span> Try clearing your filters.</span>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {expensesResponse?.data?.map(expense => {
              const category = categories.find(c => c.id === expense.category);
              return (
                <div 
                  key={expense.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(expense.date)}
                    </div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${expense.amount.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span 
                      className="inline-block w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category?.color || '#CBD5E0' }}
                    ></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                    {expense.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {expense.paymentMethod.charAt(0).toUpperCase() + expense.paymentMethod.slice(1)}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none"
                        aria-label="Edit expense"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this expense?')) {
                            // Delete expense logic would go here
                            onExpenseDeleted();
                          }
                        }}
                        className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                        aria-label="Delete expense"
                      >
                        <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loadingExpenses && !expensesError && expensesResponse?.data?.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, expensesResponse?.pagination?.total || 0)}
            </span> of{' '}
            <span className="font-medium">{expensesResponse?.pagination?.total || 0}</span> expenses
          </div>
          <div className="flex flex-wrap justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="touch-manipulation"
            >
              Previous
            </Button>
            {/* Show limited page numbers on mobile */}
            {pageNumbers.length <= 5 ? (
              pageNumbers.map(number => (
                <Button
                  key={number}
                  variant={currentPage === number ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(number)}
                  className="touch-manipulation"
                >
                  {number}
                </Button>
              ))
            ) : (
              <>
                {/* First page */}
                <Button
                  variant={currentPage === 1 ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  className="touch-manipulation"
                >
                  1
                </Button>
                
                {/* Ellipsis or second page */}
                {currentPage > 3 && (
                  <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                )}
                
                {/* Current page and neighbors */}
                {currentPage !== 1 && currentPage !== totalPages && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="touch-manipulation"
                  >
                    {currentPage}
                  </Button>
                )}
                
                {/* Ellipsis or second-to-last page */}
                {currentPage < totalPages - 2 && (
                  <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                )}
                
                {/* Last page */}
                {totalPages > 1 && (
                  <Button
                    variant={currentPage === totalPages ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="touch-manipulation"
                  >
                    {totalPages}
                  </Button>
                )}
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="touch-manipulation"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
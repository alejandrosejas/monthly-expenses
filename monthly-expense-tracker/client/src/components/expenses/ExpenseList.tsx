import React, { useState, useEffect } from 'react';
import { Expense, Category, ExpenseFilters, PaginatedResponse } from 'shared';
import { useGet } from '../../hooks/useApi';
import { formatDate } from '../../utils/date-utils';
import ExpenseItem from './ExpenseItem';
import Button from '../common/Button';

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

  // API call to get expenses
  const {
    data: expensesResponse,
    loading: loadingExpenses,
    error: expensesError,
    execute: fetchExpenses,
  } = useGet<PaginatedResponse<Expense>>('/api/expenses', {
    month,
    page: currentPage.toString(),
    limit: itemsPerPage.toString(),
    sort: sortField,
    direction: sortDirection,
    search: searchTerm,
    ...(selectedCategories.length > 0 ? { categories: selectedCategories.join(',') } : {}),
    ...(filters.minAmount ? { minAmount: filters.minAmount.toString() } : {}),
    ...(filters.maxAmount ? { maxAmount: filters.maxAmount.toString() } : {}),
    ...(filters.paymentMethods ? { paymentMethods: filters.paymentMethods.join(',') } : {}),
  });

  // Fetch expenses when dependencies change
  useEffect(() => {
    fetchExpenses();
  }, [month, currentPage, sortField, sortDirection, searchTerm, selectedCategories, filters]);

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

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setFilters({});
    setSortField('date');
    setSortDirection('desc');
    setCurrentPage(1);
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
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Advanced Filters</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Amount range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="minAmount"
                  placeholder="Min"
                  value={filters.minAmount || ''}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="number"
                  name="maxAmount"
                  placeholder="Max"
                  value={filters.maxAmount || ''}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            {/* Payment methods */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Method
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="payment_cash"
                    checked={filters.paymentMethods?.includes('cash') || false}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">Cash</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="payment_credit"
                    checked={filters.paymentMethods?.includes('credit') || false}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">Credit</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="payment_debit"
                    checked={filters.paymentMethods?.includes('debit') || false}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">Debit</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="payment_transfer"
                    checked={filters.paymentMethods?.includes('transfer') || false}
                    onChange={handleFilterChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">Transfer</span>
                </label>
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <label key={category.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-1 text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Expenses table */}
      <div className="overflow-x-auto">
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
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loadingExpenses ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading expenses...
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
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

      {/* Pagination */}
      {!loadingExpenses && !expensesError && expensesResponse?.data?.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, expensesResponse?.pagination?.total || 0)}
            </span> of{' '}
            <span className="font-medium">{expensesResponse?.pagination?.total || 0}</span> expenses
          </div>
          <div className="flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {pageNumbers.map(number => (
              <Button
                key={number}
                variant={currentPage === number ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setCurrentPage(number)}
              >
                {number}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
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
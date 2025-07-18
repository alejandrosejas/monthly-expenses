import React, { useState, useEffect } from 'react';
import { ExpenseFilters, Category, PaymentMethod } from 'shared';
import Button from '../common/Button';
import { getMonthStart, getMonthEnd } from '../../utils/date-utils';

interface AdvancedFiltersProps {
  filters: ExpenseFilters;
  categories: Category[];
  onFilterChange: (filters: ExpenseFilters) => void;
  onClearFilters: () => void;
  month: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
  month,
}) => {
  // Local state for filters
  const [localFilters, setLocalFilters] = useState<ExpenseFilters>(filters);
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const paymentMethod = name.replace('payment_', '');
      
      setLocalFilters(prev => {
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
    } else if (type === 'date') {
      setLocalFilters(prev => ({
        ...prev,
        [name]: value || undefined,
      }));
    } else if (type === 'number') {
      setLocalFilters(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value),
      }));
    } else {
      setLocalFilters(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setLocalFilters(prev => {
      const categories = prev.categories || [];
      
      if (categories.includes(categoryId)) {
        return {
          ...prev,
          categories: categories.filter(id => id !== categoryId),
        };
      } else {
        return {
          ...prev,
          categories: [...categories, categoryId],
        };
      }
    });
  };

  // Apply filters
  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  // Reset to current month
  const handleResetToMonth = () => {
    setLocalFilters(prev => ({
      ...prev,
      startDate: getMonthStart(month),
      endDate: getMonthEnd(month),
    }));
  };

  // Select all categories
  const handleSelectAllCategories = () => {
    setLocalFilters(prev => ({
      ...prev,
      categories: categories.map(c => c.id),
    }));
  };

  // Deselect all categories
  const handleDeselectAllCategories = () => {
    setLocalFilters(prev => ({
      ...prev,
      categories: [],
    }));
  };

  // Select all payment methods
  const handleSelectAllPaymentMethods = () => {
    setLocalFilters(prev => ({
      ...prev,
      paymentMethods: Object.values(PaymentMethod),
    }));
  };

  // Deselect all payment methods
  const handleDeselectAllPaymentMethods = () => {
    setLocalFilters(prev => ({
      ...prev,
      paymentMethods: [],
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Date range */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range
            </label>
            <button
              type="button"
              onClick={handleResetToMonth}
              className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Reset to current month
            </button>
          </div>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">From:</span>
              <input
                type="date"
                name="startDate"
                value={localFilters.startDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">To:</span>
              <input
                type="date"
                name="endDate"
                value={localFilters.endDate || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Amount range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount Range
          </label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Min: $</span>
              <input
                type="number"
                name="minAmount"
                placeholder="0.00"
                value={localFilters.minAmount || ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 w-12">Max: $</span>
              <input
                type="number"
                name="maxAmount"
                placeholder="0.00"
                value={localFilters.maxAmount || ''}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Search term */}
        <div>
          <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <input
            type="text"
            id="searchTerm"
            name="searchTerm"
            placeholder="Search in description..."
            value={localFilters.searchTerm || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Payment methods */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Payment Methods
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSelectAllPaymentMethods}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleDeselectAllPaymentMethods}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Deselect all
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="payment_cash"
                checked={localFilters.paymentMethods?.includes('cash') || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Cash</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="payment_credit"
                checked={localFilters.paymentMethods?.includes('credit') || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Credit Card</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="payment_debit"
                checked={localFilters.paymentMethods?.includes('debit') || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Debit Card</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="payment_transfer"
                checked={localFilters.paymentMethods?.includes('transfer') || false}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Bank Transfer</span>
            </label>
          </div>
        </div>
        
        {/* Categories */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categories
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleSelectAllCategories}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={handleDeselectAllCategories}
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Deselect all
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-2">
            {categories.map(category => (
              <label key={category.id} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.categories?.includes(category.id) || false}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span 
                  className="ml-2 text-sm flex items-center"
                  style={{ color: category.color }}
                >
                  <span 
                    className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: category.color }}
                  ></span>
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
        >
          Clear All
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default AdvancedFilters;
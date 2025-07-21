import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  
  // Check if the current path matches the link path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" 
        aria-hidden="true"
        onClick={onClose}
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Menu header with close button */}
        <div className="px-4 pt-5 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Menu</h2>
          <button
            type="button"
            className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={onClose}
          >
            <span className="sr-only">Close menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation links */}
        <div className="mt-2 flex-1 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <Link
              to="/"
              className={`${
                isActive('/') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-3 border-l-4 text-base font-medium`}
              onClick={onClose}
            >
              Dashboard
            </Link>
            <Link
              to="/expenses"
              className={`${
                isActive('/expenses') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-3 border-l-4 text-base font-medium`}
              onClick={onClose}
            >
              Expenses
            </Link>
            <Link
              to="/categories"
              className={`${
                isActive('/categories') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-3 border-l-4 text-base font-medium`}
              onClick={onClose}
            >
              Categories
            </Link>
            <Link
              to="/budgets"
              className={`${
                isActive('/budgets') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-3 border-l-4 text-base font-medium`}
              onClick={onClose}
              data-testid="mobile-budget-link"
            >
              Budgets
            </Link>
            <Link
              to="/analytics"
              className={`${
                isActive('/analytics') 
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              } block pl-3 pr-4 py-3 border-l-4 text-base font-medium`}
              onClick={onClose}
              data-testid="mobile-analytics-link"
            >
              Analytics
            </Link>
          </nav>
        </div>
        
        {/* Footer with app version or other info */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monthly Expense Tracker v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from './components/common/Button';
import MonthNavigator from './components/common/MonthNavigator';
import { getCurrentMonth } from './utils/date-utils';

// Layout components
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Monthly Expense Tracker
                </h1>
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-primary-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link to="/expenses" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Expenses
                </Link>
                <Link to="/categories" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Categories
                </Link>
                <Link to="/budgets" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Budgets
                </Link>
                <Link to="/analytics" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
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
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className="bg-primary-50 border-primary-500 text-primary-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Dashboard
            </Link>
            <Link to="/expenses" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Expenses
            </Link>
            <Link to="/categories" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Categories
            </Link>
            <Link to="/budgets" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Budgets
            </Link>
            <Link to="/analytics" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
              Analytics
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

// Dashboard page with monthly summary
import MonthSummary from './components/expenses/MonthSummary';

const Dashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  // Fetch categories
  const { 
    data: categoriesResponse, 
    loading: loadingCategories, 
    error: categoriesError, 
    execute: fetchCategories 
  } = useGet<{ data: Category[] }>('/api/categories');
  
  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        </div>
        <MonthNavigator 
          currentMonth={currentMonth} 
          onMonthChange={setCurrentMonth} 
        />
      </div>
      
      {loadingCategories ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : categoriesError ? (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading categories</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Unable to load categories. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MonthSummary 
          month={currentMonth}
          categories={categoriesResponse?.data || []}
        />
      )}
    </div>
  );
};

import ExpenseForm from './components/expenses/ExpenseForm';
import ExpenseList from './components/expenses/ExpenseList';
import { useGet } from './hooks/useApi';
import { Category, Expense, formatMonthYear, getPreviousMonth, getNextMonth } from 'shared';

const Expenses = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Fetch categories
  const { 
    data: categoriesResponse, 
    loading: loadingCategories, 
    error: categoriesError, 
    execute: fetchCategories 
  } = useGet<{ data: Category[] }>('/api/categories');
  
  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Handle expense added or updated
  const handleExpenseSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
  };
  
  // Handle edit expense
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header with month navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h2>
        </div>
        <div className="flex items-center space-x-4">
          <MonthNavigator 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth} 
          />
          <Button 
            variant="primary" 
            onClick={() => {
              setEditingExpense(null);
              setShowForm(!showForm);
            }}
          >
            {showForm && !editingExpense ? 'Cancel' : 'Add Expense'}
          </Button>
        </div>
      </div>
      
      {/* Expense form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          {loadingCategories ? (
            <p className="text-gray-600 dark:text-gray-300">Loading categories...</p>
          ) : categoriesError ? (
            <p className="text-red-600">Error loading categories. Please try again.</p>
          ) : (
            <ExpenseForm 
              expense={editingExpense || undefined}
              categories={categoriesResponse?.data || []}
              onSuccess={handleExpenseSuccess}
              onCancel={() => {
                setShowForm(false);
                setEditingExpense(null);
              }}
            />
          )}
        </div>
      )}
      
      {/* Expense list */}
      {!loadingCategories && !categoriesError && (
        <ExpenseList
          month={currentMonth}
          categories={categoriesResponse?.data || []}
          onEditExpense={handleEditExpense}
          onExpenseDeleted={fetchCategories}
        />
      )}
    </div>
  );
};

const Categories = () => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Categories</h2>
    <p className="text-gray-600 dark:text-gray-300">Category management interface will be implemented here.</p>
  </div>
);

import BudgetTracker from './components/budget/BudgetTracker';

const Budgets = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  // Fetch categories
  const { 
    data: categoriesResponse, 
    loading: loadingCategories, 
    error: categoriesError, 
    execute: fetchCategories 
  } = useGet<{ data: Category[] }>('/api/categories');
  
  // Fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
        </div>
        <MonthNavigator 
          currentMonth={currentMonth} 
          onMonthChange={setCurrentMonth} 
        />
      </div>
      
      {loadingCategories ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : categoriesError ? (
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading categories</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>Unable to load categories. Please try again.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <BudgetTracker 
          month={currentMonth}
          categories={categoriesResponse?.data || []}
        />
      )}
    </div>
  );
};

import ExpenseChart from './components/analytics/ExpenseChart';
import TrendChart from './components/analytics/TrendChart';

const Analytics = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
        </div>
        <MonthNavigator 
          currentMonth={currentMonth} 
          onMonthChange={setCurrentMonth} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ExpenseChart month={currentMonth} />
        <TrendChart month={currentMonth} />
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
          Insights
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          View your spending patterns and trends to make informed financial decisions.
          The charts above show your expense breakdown by category and spending trends over time.
        </p>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
    <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">404 - Page Not Found</h2>
    <p className="text-gray-600 dark:text-gray-300 mb-4">The page you are looking for does not exist.</p>
    <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
      Return to Dashboard
    </Link>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/expenses" element={
          <Layout>
            <Expenses />
          </Layout>
        } />
        <Route path="/categories" element={
          <Layout>
            <Categories />
          </Layout>
        } />
        <Route path="/budgets" element={
          <Layout>
            <Budgets />
          </Layout>
        } />
        <Route path="/analytics" element={
          <Layout>
            <Analytics />
          </Layout>
        } />
        <Route path="*" element={
          <Layout>
            <NotFound />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
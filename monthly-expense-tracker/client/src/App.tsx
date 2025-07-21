import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import Button from './components/common/Button';
import MobileMenu from './components/common/MobileMenu';
import MonthNavigator from './components/common/MonthNavigator';
import ErrorBoundary from './components/common/ErrorBoundary';
import ToastProvider, { useToast } from './components/common/Toast';
import Skeleton from './components/common/Skeleton';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { getCurrentMonth } from './utils/date-utils';

// Lazy load page components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Categories = lazy(() => import('./pages/Categories'));
const Budgets = lazy(() => import('./pages/Budgets'));
const Analytics = lazy(() => import('./pages/Analytics'));

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
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-none">
                  Monthly Expense Tracker
                </h1>
              </div>
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                <Link to="/" className="border-primary-500 text-gray-900 dark:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" data-testid="dashboard-tab">
                  Dashboard
                </Link>
                <Link to="/expenses" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" data-testid="expenses-tab">
                  Expenses
                </Link>
                <Link to="/categories" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" data-testid="categories-tab">
                  Categories
                </Link>
                <Link to="/budgets" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" data-testid="budget-tab">
                  Budgets
                </Link>
                <Link to="/analytics" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" data-testid="analytics-tab">
                  Analytics
                </Link>
              </nav>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                aria-expanded={isMobileMenuOpen}
                data-testid="mobile-menu-button"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Use our new MobileMenu component */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

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
    <ToastProvider>
      <ExpenseProvider>
        <Router>
          <ErrorBoundary>
            <Routes>
            <Route path="/" element={
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Dashboard />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            } />
            <Route path="/expenses" element={
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Expenses />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            } />
            <Route path="/categories" element={
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Categories />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            } />
            <Route path="/budgets" element={
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Budgets />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            } />
            <Route path="/analytics" element={
              <Layout>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Analytics />
                  </Suspense>
                </ErrorBoundary>
              </Layout>
            } />
            <Route path="*" element={
              <Layout>
                <ErrorBoundary>
                  <NotFound />
                </ErrorBoundary>
              </Layout>
            } />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ExpenseProvider>
    </ToastProvider>
  );
}

export default App;
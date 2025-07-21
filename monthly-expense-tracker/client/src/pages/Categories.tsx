import CategoryManager from '../components/categories/CategoryManager';
import Button from '../components/common/Button';
import { useExpenseState } from '../hooks/useExpenseState';

const Categories = () => {
  const {
    categories,
    loading,
    errors,
    refreshCategories,
  } = useExpenseState();
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6" data-testid="categories-section">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage your expense categories to better organize your spending.
        </p>
      </div>
      
      {loading.categories ? (
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : errors.categories ? (
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
                <p>{errors.categories}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={refreshCategories}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <CategoryManager 
          categories={categories}
          onCategoryChange={refreshCategories}
        />
      )}
    </div>
  );
};

export default Categories;
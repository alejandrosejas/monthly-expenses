import { useState } from 'react';
import ExpenseForm from '../components/expenses/ExpenseForm';
import ExpenseList from '../components/expenses/ExpenseList';
import MonthNavigator from '../components/common/MonthNavigator';
import Button from '../components/common/Button';
import { useExpenseState } from '../hooks/useExpenseState';
import { getCurrentMonth } from '../utils/date-utils';
import { Expense } from 'shared';

const Expenses = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const {
    categories,
    loading,
    errors,
    refreshCategories,
  } = useExpenseState({ month: currentMonth });
  
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
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6" data-testid="expenses-section">
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
            data-testid="add-expense-toggle"
          >
            {showForm && !editingExpense ? 'Cancel' : 'Add Expense'}
          </Button>
        </div>
      </div>
      
      {/* Expense form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
          {loading.categories ? (
            <p className="text-gray-600 dark:text-gray-300">Loading categories...</p>
          ) : errors.categories ? (
            <p className="text-red-600">Error loading categories. Please try again.</p>
          ) : (
            <ExpenseForm 
              expense={editingExpense || undefined}
              categories={categories}
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
      {!loading.categories && !errors.categories && (
        <ExpenseList
          month={currentMonth}
          categories={categories}
          onEditExpense={handleEditExpense}
          onExpenseDeleted={refreshCategories}
        />
      )}
    </div>
  );
};

export default Expenses;
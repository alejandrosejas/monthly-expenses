import React, { useState } from 'react';
import { Expense, Category } from 'shared';
import { formatDate } from '../../utils/date-utils';
import { useDelete } from '../../hooks/useApi';
import Button from '../common/Button';

interface ExpenseItemProps {
  expense: Expense;
  category?: Category;
  onEdit: () => void;
  onDelete: () => void;
  searchTerm?: string;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  category,
  onEdit,
  onDelete,
  searchTerm = '',
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Delete expense API hook
  const deleteExpense = useDelete<{ success: boolean }>(`/api/expenses/${expense.id}`);
  
  // Handle delete button click
  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };
  
  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense.execute();
      onDelete();
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };
  
  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };
  
  // Highlight search term in text
  const highlightSearchTerm = (text: string) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return text;
    }
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <span key={i} className="bg-yellow-200 dark:bg-yellow-700">{part}</span>
          ) : (
            part
          )
        )}
      </>
    );
  };
  
  // Format payment method for display
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'credit':
        return 'Credit Card';
      case 'debit':
        return 'Debit Card';
      case 'transfer':
        return 'Bank Transfer';
      default:
        return method;
    }
  };
  
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {formatDate(expense.date)}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
        ${expense.amount.toFixed(2)}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
        <span 
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: category?.color ? `${category.color}33` : '#e5e7eb',
            color: category?.color ? category.color : '#374151'
          }}
        >
          {highlightSearchTerm(category?.name || 'Uncategorized')}
        </span>
      </td>
      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
        {highlightSearchTerm(expense.description)}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {formatPaymentMethod(expense.paymentMethod)}
      </td>
      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {showConfirmDelete ? (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className="touch-manipulation"
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full touch-manipulation"
              aria-label="Edit expense"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full touch-manipulation"
              aria-label="Delete expense"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default ExpenseItem;
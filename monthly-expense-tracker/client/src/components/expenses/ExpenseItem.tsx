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
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {formatDate(expense.date)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        ${expense.amount.toFixed(2)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
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
      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
        {highlightSearchTerm(expense.description)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
        {formatPaymentMethod(expense.paymentMethod)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {showConfirmDelete ? (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteClick}
            >
              Delete
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default ExpenseItem;
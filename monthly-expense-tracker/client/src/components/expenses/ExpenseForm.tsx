import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { ExpenseInput, PaymentMethod, Category } from 'shared';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import { toISODateString } from '../../utils/date-utils';
import { useExpenseState } from '../../hooks/useExpenseState';

interface ExpenseFormProps {
  expense?: ExpenseInput & { id?: string };
  onSuccess?: (expense: ExpenseInput & { id: string }) => void;
  onCancel?: () => void;
  categories: Category[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  onSuccess,
  onCancel,
  categories,
}) => {
  // Initialize form state with default values or existing expense
  const [formData, setFormData] = useState<ExpenseInput>({
    date: expense?.date || toISODateString(new Date()),
    amount: expense?.amount || 0,
    category: expense?.category || (categories[0]?.id || ''),
    description: expense?.description || '',
    paymentMethod: expense?.paymentMethod || PaymentMethod.CASH,
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toast notifications
  const { addToast } = useToast();

  // Get expense state management
  const { addExpense, updateExpense: updateExpenseState } = useExpenseState();

  // Update category when categories change and current category is not available
  useEffect(() => {
    if (categories.length > 0 && !categories.some(c => c.id === formData.category)) {
      setFormData(prev => ({ ...prev, category: categories[0].id }));
    }
  }, [categories, formData.category]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    let parsedValue: string | number = value;
    if (type === 'number') {
      parsedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const validationSchema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
      amount: z.number()
        .positive('Amount must be greater than 0')
        .max(999999.99, 'Amount must be less than 1,000,000'),
      category: z.string().min(1, 'Category is required'),
      description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
      paymentMethod: z.enum([
        PaymentMethod.CASH, 
        PaymentMethod.CREDIT, 
        PaymentMethod.DEBIT, 
        PaymentMethod.TRANSFER
      ], {
        errorMap: () => ({ message: 'Invalid payment method' }),
      }),
    });

    try {
      validationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          const path = err.path[0].toString();
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (expense?.id) {
        result = await updateExpenseState(expense.id, formData);
      } else {
        result = await addExpense(formData);
      }
      
      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      // Handle API errors
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, form: error.message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="expense-form">
      {/* Form title */}
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        {expense?.id ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Date field */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm
              ${errors.date ? 'border-red-500' : ''}
              h-10 sm:h-auto text-base sm:text-sm touch-manipulation`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>
        
        {/* Amount field */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="0.00"
              inputMode="decimal"
              data-testid="expense-amount"
              className={`block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm
                ${errors.amount ? 'border-red-500' : ''}
                h-10 sm:h-auto text-base sm:text-sm touch-manipulation`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600" data-testid="amount-error">{errors.amount}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category field */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            data-testid="expense-category"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm
              ${errors.category ? 'border-red-500' : ''}
              h-10 sm:h-auto text-base sm:text-sm touch-manipulation py-2`}
          >
            {categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
        
        {/* Payment Method field */}
        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            data-testid="expense-payment-method"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm
              ${errors.paymentMethod ? 'border-red-500' : ''}
              h-10 sm:h-auto text-base sm:text-sm touch-manipulation py-2`}
          >
            <option value={PaymentMethod.CASH}>Cash</option>
            <option value={PaymentMethod.CREDIT}>Credit Card</option>
            <option value={PaymentMethod.DEBIT}>Debit Card</option>
            <option value={PaymentMethod.TRANSFER}>Bank Transfer</option>
          </select>
          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{errors.paymentMethod}</p>
          )}
        </div>
      </div>
      
      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          data-testid="expense-description"
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm
            ${errors.description ? 'border-red-500' : ''}
            text-base sm:text-sm touch-manipulation`}
          placeholder="Enter expense description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600" data-testid="description-error">{errors.description}</p>
        )}
      </div>
      
      {/* Form-level error message */}
      {errors.form && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errors.form}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Form actions */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
          data-testid={expense?.id ? "save-expense-button" : "add-expense-button"}
        >
          {expense?.id ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
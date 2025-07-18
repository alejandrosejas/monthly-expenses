// Re-export types from validation.ts to maintain backward compatibility
export type {
  Expense,
  ExpenseInput,
  Category,
  CategoryInput,
  Budget,
  BudgetInput,
  PaymentMethodType,
  ErrorResponse
} from './validation';

export { PaymentMethod } from './validation';

// Additional types for API responses
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Types for analytics
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface MonthlyTotal {
  month: string;
  total: number;
}

export interface DailyTotal {
  date: string;
  total: number;
}

export interface BudgetStatus {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'exceeded';
}

export interface MonthComparison {
  category: string;
  currentMonth: {
    month: string;
    amount: number;
  };
  previousMonth: {
    month: string;
    amount: number;
  };
  difference: number;
  percentageChange: number;
}

// Types for filtering and pagination
export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: string[];
  searchTerm?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
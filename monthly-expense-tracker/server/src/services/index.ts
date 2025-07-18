import { ExpenseService } from './expense-service';
import { CategoryService } from './category-service';
import { BudgetService } from './budget-service';

// Export service classes
export {
  ExpenseService,
  CategoryService,
  BudgetService
};

// Export service instances
export const services = {
  expense: new ExpenseService(),
  category: new CategoryService(),
  budget: new BudgetService()
};
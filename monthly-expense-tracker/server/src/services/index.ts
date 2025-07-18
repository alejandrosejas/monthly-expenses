import { ExpenseService } from './expense-service';
import { CategoryService } from './category-service';
import { BudgetService } from './budget-service';
import { AnalyticsService } from './analytics-service';
import { ExportService } from './export-service';

// Export service classes
export {
  ExpenseService,
  CategoryService,
  BudgetService,
  AnalyticsService,
  ExportService
};

// Export service instances
export const services = {
  expense: new ExpenseService(),
  category: new CategoryService(),
  budget: new BudgetService(),
  analytics: new AnalyticsService(
    new ExpenseService().repository,
    new CategoryService().repository
  ),
  export: new ExportService(
    new ExpenseService().repository,
    new CategoryService().repository,
    new BudgetService().repository,
    new AnalyticsService(
      new ExpenseService().repository,
      new CategoryService().repository
    )
  )
};
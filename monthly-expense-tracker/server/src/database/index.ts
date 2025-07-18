// Export database connection functions
export {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  runMigrations,
  seedDatabase
} from './connection';

// Export repositories
export { BaseRepository } from './base-repository';
export { CategoryRepository } from './category-repository';
export { ExpenseRepository } from './expense-repository';
export { BudgetRepository } from './budget-repository';

// Export repository instances
export const repositories = {
  category: new CategoryRepository(),
  expense: new ExpenseRepository(),
  budget: new BudgetRepository()
};
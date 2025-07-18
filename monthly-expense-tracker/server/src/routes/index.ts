import { Router } from 'express';
import healthRoutes from './health';
import categoryRoutes from './categories';
import expenseRoutes from './expenses';
import budgetRoutes from './budgets';

const router = Router();

// Register routes
router.use('/health', healthRoutes);
router.use('/categories', categoryRoutes);

// Special expense routes that need to come before the /:id route
router.get('/expenses/summary/:month', expenseRoutes);
router.get('/expenses/daily/:month', expenseRoutes);
router.get('/expenses/monthly', expenseRoutes);
router.get('/expenses/category/:categoryId', expenseRoutes);
router.get('/expenses/month/:month', expenseRoutes);

// Regular expense routes
router.use('/expenses', expenseRoutes);

// Special budget routes that need to come before the /:month route
router.get('/budgets/range', budgetRoutes);

// Regular budget routes
router.use('/budgets', budgetRoutes);

export default router;
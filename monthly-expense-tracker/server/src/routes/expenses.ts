import { Router } from 'express';
import { services } from '../services';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils';
import { validateRequest } from '../middleware';
import { ExpenseSchema } from 'shared';
import { z } from 'zod';

const router = Router();
const expenseService = services.expense;
const categoryService = services.category;

// Schema for query parameters
const QuerySchema = z.object({
  month: z.string().optional(),
  category: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  paymentMethod: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

// Schema for date range parameters
const DateRangeSchema = z.object({
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Start month must be in YYYY-MM format'),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/, 'End month must be in YYYY-MM format')
});

/**
 * @route GET /api/expenses
 * @desc Get expenses with filtering and pagination
 * @access Public
 */
router.get('/', validateRequest(QuerySchema, 'query'), async (req, res, next) => {
  try {
    const {
      month,
      category,
      minAmount,
      maxAmount,
      paymentMethod,
      search,
      page,
      limit
    } = req.query;
    
    // Build filters
    const filters = {
      ...(month && { startDate: `${month}-01`, endDate: `${month}-31` }),
      ...(category && { categories: [category as string] }),
      ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
      ...(maxAmount !== undefined && { maxAmount: Number(maxAmount) }),
      ...(paymentMethod && { paymentMethods: [paymentMethod as string] }),
      ...(search && { searchTerm: search as string })
    };
    
    // Get expenses with filters and pagination
    const { expenses, total } = await expenseService.getExpenses(
      filters,
      { page: Number(page), limit: Number(limit) }
    );
    
    return sendPaginated(res, expenses, total, Number(page), Number(limit));
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/:id
 * @desc Get an expense by ID
 * @access Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const expense = await expenseService.getExpenseById(id);
    return sendSuccess(res, expense);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/expenses
 * @desc Create a new expense
 * @access Public
 */
router.post('/', validateRequest(ExpenseSchema), async (req, res, next) => {
  try {
    const expense = await expenseService.createExpense(req.body);
    return sendCreated(res, expense, 'Expense created successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/expenses/:id
 * @desc Update an expense
 * @access Public
 */
router.put('/:id', validateRequest(ExpenseSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedExpense = await expenseService.updateExpense(id, req.body);
    return sendSuccess(res, updatedExpense, 'Expense updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/expenses/:id
 * @desc Delete an expense
 * @access Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await expenseService.deleteExpense(id);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/summary/:month
 * @desc Get monthly summary (total by category)
 * @access Public
 */
router.get('/summary/:month', async (req, res, next) => {
  try {
    const { month } = req.params;
    const summary = await expenseService.getMonthlySummary(month);
    
    // Enhance summary with category details
    const enhancedSummary = await Promise.all(
      summary.map(async (item) => {
        try {
          const category = await categoryService.getCategoryById(item.category);
          return {
            ...item,
            categoryName: category.name,
            color: category.color
          };
        } catch (error) {
          // If category not found, use default values
          return {
            ...item,
            categoryName: 'Unknown Category',
            color: '#CCCCCC'
          };
        }
      })
    );
    
    return sendSuccess(res, enhancedSummary);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/daily/:month
 * @desc Get daily totals for a month
 * @access Public
 */
router.get('/daily/:month', async (req, res, next) => {
  try {
    const { month } = req.params;
    const dailyTotals = await expenseService.getDailyTotals(month);
    return sendSuccess(res, dailyTotals);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/monthly
 * @desc Get monthly totals for a date range
 * @access Public
 */
router.get('/monthly', validateRequest(DateRangeSchema, 'query'), async (req, res, next) => {
  try {
    const { startMonth, endMonth } = req.query;
    const monthlyTotals = await expenseService.getMonthlyTotals(
      startMonth as string,
      endMonth as string
    );
    return sendSuccess(res, monthlyTotals);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/category/:categoryId
 * @desc Get expenses by category
 * @access Public
 */
router.get('/category/:categoryId', async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const expenses = await expenseService.getExpensesByCategory(categoryId);
    return sendSuccess(res, expenses);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/expenses/month/:month
 * @desc Get expenses by month
 * @access Public
 */
router.get('/month/:month', async (req, res, next) => {
  try {
    const { month } = req.params;
    const expenses = await expenseService.getExpensesByMonth(month);
    return sendSuccess(res, expenses);
  } catch (error) {
    next(error);
  }
});

export default router;
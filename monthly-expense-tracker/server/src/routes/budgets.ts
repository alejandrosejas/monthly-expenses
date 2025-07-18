import { Router } from 'express';
import { services } from '../services';
import { sendSuccess, sendCreated, sendNoContent } from '../utils';
import { validateRequest } from '../middleware';
import { BudgetSchema } from 'shared';
import { z } from 'zod';

const router = Router();
const budgetService = services.budget;

// Schema for date range parameters
const DateRangeSchema = z.object({
  startMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Start month must be in YYYY-MM format'),
  endMonth: z.string().regex(/^\d{4}-\d{2}$/, 'End month must be in YYYY-MM format')
});

/**
 * @route GET /api/budgets/:month
 * @desc Get budget for a specific month
 * @access Public
 */
router.get('/:month', async (req, res, next) => {
  try {
    const { month } = req.params;
    const budget = await budgetService.getBudgetByMonth(month);
    
    if (!budget) {
      // Return empty budget if none exists
      return sendSuccess(res, {
        month,
        totalBudget: 0,
        categoryBudgets: {}
      });
    }
    
    return sendSuccess(res, budget);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/budgets
 * @desc Create or update a budget
 * @access Public
 */
router.post('/', validateRequest(BudgetSchema), async (req, res, next) => {
  try {
    const budget = await budgetService.createOrUpdateBudget(req.body);
    return sendCreated(res, budget, 'Budget created/updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/budgets/:id
 * @desc Delete a budget
 * @access Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await budgetService.deleteBudget(id);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/budgets/:month/status
 * @desc Get budget status with expenses for a month
 * @access Public
 */
router.get('/:month/status', async (req, res, next) => {
  try {
    const { month } = req.params;
    const budgetStatus = await budgetService.getBudgetStatus(month);
    return sendSuccess(res, budgetStatus);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/budgets/range
 * @desc Get budgets for a range of months
 * @access Public
 */
router.get('/range', validateRequest(DateRangeSchema, 'query'), async (req, res, next) => {
  try {
    const { startMonth, endMonth } = req.query;
    const budgets = await budgetService.getBudgetsByMonthRange(
      startMonth as string,
      endMonth as string
    );
    return sendSuccess(res, budgets);
  } catch (error) {
    next(error);
  }
});

export default router;
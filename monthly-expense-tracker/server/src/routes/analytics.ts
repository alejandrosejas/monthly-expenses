import { Router } from 'express';
import { z } from 'zod';
import { AnalyticsService } from '../services/analytics-service';
import { ExpenseRepository } from '../database/expense-repository';
import { CategoryRepository } from '../database/category-repository';
import { validateRequest } from '../middleware';
import { createSuccessResponse } from '../utils';

const router = Router();

// Create repositories and service
const expenseRepository = new ExpenseRepository();
const categoryRepository = new CategoryRepository();
const analyticsService = new AnalyticsService(expenseRepository, categoryRepository);

// Validation schemas
const MonthParamSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});

const MonthComparisonParamSchema = z.object({
  currentMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Current month must be in YYYY-MM format'),
  previousMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Previous month must be in YYYY-MM format')
});

/**
 * GET /api/analytics/category-breakdown/:month
 * Get category breakdown for a specific month
 */
router.get(
  '/category-breakdown/:month',
  validateRequest({ params: MonthParamSchema }),
  async (req, res, next) => {
    try {
      const { month } = req.params;
      const breakdown = await analyticsService.getCategoryBreakdown(month);
      
      return res.json(createSuccessResponse(breakdown));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/monthly-totals/:month
 * Get monthly totals for the last 6 months ending with the specified month
 */
router.get(
  '/monthly-totals/:month',
  validateRequest({ params: MonthParamSchema }),
  async (req, res, next) => {
    try {
      const { month } = req.params;
      const count = req.query.count ? parseInt(req.query.count as string, 10) : 6;
      
      const totals = await analyticsService.getMonthlyTotals(month, count);
      
      return res.json(createSuccessResponse(totals));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/daily-totals/:month
 * Get daily totals for a specific month
 */
router.get(
  '/daily-totals/:month',
  validateRequest({ params: MonthParamSchema }),
  async (req, res, next) => {
    try {
      const { month } = req.params;
      const totals = await analyticsService.getDailyTotals(month);
      
      return res.json(createSuccessResponse(totals));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/compare/:currentMonth/:previousMonth
 * Compare expenses between two months
 */
router.get(
  '/compare/:currentMonth/:previousMonth',
  validateRequest({
    params: MonthComparisonParamSchema
  }),
  async (req, res, next) => {
    try {
      const { currentMonth, previousMonth } = req.params;
      const comparison = await analyticsService.compareMonths(currentMonth, previousMonth);
      
      return res.json(createSuccessResponse(comparison));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/trend-analysis/:month
 * Get trend analysis for a specific month with historical context
 */
router.get(
  '/trend-analysis/:month',
  validateRequest({ params: MonthParamSchema }),
  async (req, res, next) => {
    try {
      const { month } = req.params;
      const months = req.query.months ? parseInt(req.query.months as string, 10) : 6;
      
      const trendAnalysis = await analyticsService.getTrendAnalysis(month, months);
      
      return res.json(createSuccessResponse(trendAnalysis));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
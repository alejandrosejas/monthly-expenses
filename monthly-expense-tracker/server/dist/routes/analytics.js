"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const analytics_service_1 = require("../services/analytics-service");
const expense_repository_1 = require("../database/expense-repository");
const category_repository_1 = require("../database/category-repository");
const middleware_1 = require("../middleware");
const utils_1 = require("../utils");
const router = (0, express_1.Router)();
// Create repositories and service
const expenseRepository = new expense_repository_1.ExpenseRepository();
const categoryRepository = new category_repository_1.CategoryRepository();
const analyticsService = new analytics_service_1.AnalyticsService(expenseRepository, categoryRepository);
// Validation schemas
const MonthParamSchema = zod_1.z.object({
    month: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format')
});
const MonthComparisonParamSchema = zod_1.z.object({
    currentMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Current month must be in YYYY-MM format'),
    previousMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Previous month must be in YYYY-MM format')
});
/**
 * GET /api/analytics/category-breakdown/:month
 * Get category breakdown for a specific month
 */
router.get('/category-breakdown/:month', (0, middleware_1.validateRequest)({ params: MonthParamSchema }), async (req, res, next) => {
    try {
        const { month } = req.params;
        const breakdown = await analyticsService.getCategoryBreakdown(month);
        return res.json((0, utils_1.createSuccessResponse)(breakdown));
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/analytics/monthly-totals/:month
 * Get monthly totals for the last 6 months ending with the specified month
 */
router.get('/monthly-totals/:month', (0, middleware_1.validateRequest)({ params: MonthParamSchema }), async (req, res, next) => {
    try {
        const { month } = req.params;
        const count = req.query.count ? parseInt(req.query.count, 10) : 6;
        const totals = await analyticsService.getMonthlyTotals(month, count);
        return res.json((0, utils_1.createSuccessResponse)(totals));
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/analytics/daily-totals/:month
 * Get daily totals for a specific month
 */
router.get('/daily-totals/:month', (0, middleware_1.validateRequest)({ params: MonthParamSchema }), async (req, res, next) => {
    try {
        const { month } = req.params;
        const totals = await analyticsService.getDailyTotals(month);
        return res.json((0, utils_1.createSuccessResponse)(totals));
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/analytics/compare/:currentMonth/:previousMonth
 * Compare expenses between two months
 */
router.get('/compare/:currentMonth/:previousMonth', (0, middleware_1.validateRequest)({
    params: MonthComparisonParamSchema
}), async (req, res, next) => {
    try {
        const { currentMonth, previousMonth } = req.params;
        const comparison = await analyticsService.compareMonths(currentMonth, previousMonth);
        return res.json((0, utils_1.createSuccessResponse)(comparison));
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/analytics/trend-analysis/:month
 * Get trend analysis for a specific month with historical context
 */
router.get('/trend-analysis/:month', (0, middleware_1.validateRequest)({ params: MonthParamSchema }), async (req, res, next) => {
    try {
        const { month } = req.params;
        const months = req.query.months ? parseInt(req.query.months, 10) : 6;
        const trendAnalysis = await analyticsService.getTrendAnalysis(month, months);
        return res.json((0, utils_1.createSuccessResponse)(trendAnalysis));
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

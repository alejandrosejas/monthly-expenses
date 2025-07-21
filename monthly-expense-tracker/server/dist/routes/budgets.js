"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const utils_1 = require("../utils");
const middleware_1 = require("../middleware");
const shared_1 = require("shared");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const budgetService = services_1.services.budget;
// Schema for date range parameters
const DateRangeSchema = zod_1.z.object({
    startMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Start month must be in YYYY-MM format'),
    endMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'End month must be in YYYY-MM format')
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
            return (0, utils_1.sendSuccess)(res, {
                month,
                totalBudget: 0,
                categoryBudgets: {}
            });
        }
        return (0, utils_1.sendSuccess)(res, budget);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /api/budgets
 * @desc Create or update a budget
 * @access Public
 */
router.post('/', (0, middleware_1.validateRequest)(shared_1.BudgetSchema), async (req, res, next) => {
    try {
        const budget = await budgetService.createOrUpdateBudget(req.body);
        return (0, utils_1.sendCreated)(res, budget, 'Budget created/updated successfully');
    }
    catch (error) {
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
        return (0, utils_1.sendNoContent)(res);
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, budgetStatus);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /api/budgets/range
 * @desc Get budgets for a range of months
 * @access Public
 */
router.get('/range', (0, middleware_1.validateRequest)(DateRangeSchema, 'query'), async (req, res, next) => {
    try {
        const { startMonth, endMonth } = req.query;
        const budgets = await budgetService.getBudgetsByMonthRange(startMonth, endMonth);
        return (0, utils_1.sendSuccess)(res, budgets);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

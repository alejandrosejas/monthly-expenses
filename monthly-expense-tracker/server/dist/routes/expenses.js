"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const utils_1 = require("../utils");
const middleware_1 = require("../middleware");
const shared_1 = require("shared");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const expenseService = services_1.services.expense;
const categoryService = services_1.services.category;
// Schema for query parameters
const QuerySchema = zod_1.z.object({
    month: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    minAmount: zod_1.z.coerce.number().optional(),
    maxAmount: zod_1.z.coerce.number().optional(),
    paymentMethod: zod_1.z.string().optional(),
    search: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20)
});
// Schema for date range parameters
const DateRangeSchema = zod_1.z.object({
    startMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'Start month must be in YYYY-MM format'),
    endMonth: zod_1.z.string().regex(/^\d{4}-\d{2}$/, 'End month must be in YYYY-MM format')
});
/**
 * @route GET /api/expenses
 * @desc Get expenses with filtering and pagination
 * @access Public
 */
router.get('/', (0, middleware_1.validateRequest)(QuerySchema, 'query'), async (req, res, next) => {
    try {
        const { month, category, minAmount, maxAmount, paymentMethod, search, page, limit } = req.query;
        // Build filters
        const filters = {
            ...(month && { startDate: `${month}-01`, endDate: `${month}-31` }),
            ...(category && { categories: [category] }),
            ...(minAmount !== undefined && { minAmount: Number(minAmount) }),
            ...(maxAmount !== undefined && { maxAmount: Number(maxAmount) }),
            ...(paymentMethod && { paymentMethods: [paymentMethod] }),
            ...(search && { searchTerm: search })
        };
        // Get expenses with filters and pagination
        const { expenses, total } = await expenseService.getExpenses(filters, { page: Number(page), limit: Number(limit) });
        return (0, utils_1.sendPaginated)(res, expenses, total, Number(page), Number(limit));
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, expense);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /api/expenses
 * @desc Create a new expense
 * @access Public
 */
router.post('/', (0, middleware_1.validateRequest)(shared_1.ExpenseSchema), async (req, res, next) => {
    try {
        const expense = await expenseService.createExpense(req.body);
        return (0, utils_1.sendCreated)(res, expense, 'Expense created successfully');
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /api/expenses/:id
 * @desc Update an expense
 * @access Public
 */
router.put('/:id', (0, middleware_1.validateRequest)(shared_1.ExpenseSchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedExpense = await expenseService.updateExpense(id, req.body);
        return (0, utils_1.sendSuccess)(res, updatedExpense, 'Expense updated successfully');
    }
    catch (error) {
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
        return (0, utils_1.sendNoContent)(res);
    }
    catch (error) {
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
        const enhancedSummary = await Promise.all(summary.map(async (item) => {
            try {
                const category = await categoryService.getCategoryById(item.category);
                return {
                    ...item,
                    categoryName: category.name,
                    color: category.color
                };
            }
            catch (error) {
                // If category not found, use default values
                return {
                    ...item,
                    categoryName: 'Unknown Category',
                    color: '#CCCCCC'
                };
            }
        }));
        return (0, utils_1.sendSuccess)(res, enhancedSummary);
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, dailyTotals);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route GET /api/expenses/monthly
 * @desc Get monthly totals for a date range
 * @access Public
 */
router.get('/monthly', (0, middleware_1.validateRequest)(DateRangeSchema, 'query'), async (req, res, next) => {
    try {
        const { startMonth, endMonth } = req.query;
        const monthlyTotals = await expenseService.getMonthlyTotals(startMonth, endMonth);
        return (0, utils_1.sendSuccess)(res, monthlyTotals);
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, expenses);
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, expenses);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

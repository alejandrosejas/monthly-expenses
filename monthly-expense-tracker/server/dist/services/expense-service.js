"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseService = void 0;
const database_1 = require("../database");
const errors_1 = require("../utils/errors");
const { expense: expenseRepository, category: categoryRepository } = database_1.repositories;
/**
 * Service for expense management
 */
class ExpenseService {
    /**
     * Get all expenses with optional filtering and pagination
     */
    async getExpenses(filters, pagination) {
        return expenseRepository.findWithFilters(filters, pagination);
    }
    /**
     * Get an expense by ID
     */
    async getExpenseById(id) {
        const expense = await expenseRepository.findById(id);
        if (!expense) {
            throw new errors_1.NotFoundError(`Expense with ID ${id} not found`);
        }
        return expense;
    }
    /**
     * Create a new expense
     */
    async createExpense(data) {
        // Validate that the category exists
        const category = await categoryRepository.findById(data.category);
        if (!category) {
            throw new errors_1.NotFoundError(`Category with ID ${data.category} not found`);
        }
        // Create the expense
        return expenseRepository.create(data);
    }
    /**
     * Update an existing expense
     */
    async updateExpense(id, data) {
        // Validate that the expense exists
        const existingExpense = await expenseRepository.findById(id);
        if (!existingExpense) {
            throw new errors_1.NotFoundError(`Expense with ID ${id} not found`);
        }
        // If category is being updated, validate that it exists
        if (data.category && data.category !== existingExpense.category) {
            const category = await categoryRepository.findById(data.category);
            if (!category) {
                throw new errors_1.NotFoundError(`Category with ID ${data.category} not found`);
            }
        }
        // Update the expense
        const updatedExpense = await expenseRepository.update(id, data);
        if (!updatedExpense) {
            throw new errors_1.NotFoundError(`Expense with ID ${id} not found`);
        }
        return updatedExpense;
    }
    /**
     * Delete an expense
     */
    async deleteExpense(id) {
        const deleted = await expenseRepository.deleteById(id);
        if (!deleted) {
            throw new errors_1.NotFoundError(`Expense with ID ${id} not found`);
        }
    }
    /**
     * Get monthly summary (total by category)
     */
    async getMonthlySummary(month) {
        return expenseRepository.getMonthlySummary(month);
    }
    /**
     * Get daily totals for a month
     */
    async getDailyTotals(month) {
        return expenseRepository.getDailyTotals(month);
    }
    /**
     * Get monthly totals for a date range
     */
    async getMonthlyTotals(startMonth, endMonth) {
        return expenseRepository.getMonthlyTotals(startMonth, endMonth);
    }
    /**
     * Get expenses by category
     */
    async getExpensesByCategory(categoryId) {
        // Validate that the category exists
        const category = await categoryRepository.findById(categoryId);
        if (!category) {
            throw new errors_1.NotFoundError(`Category with ID ${categoryId} not found`);
        }
        return expenseRepository.findByCategory(categoryId);
    }
    /**
     * Get expenses by month
     */
    async getExpensesByMonth(month) {
        return expenseRepository.findByMonth(month);
    }
}
exports.ExpenseService = ExpenseService;

import { v4 as uuidv4 } from 'uuid';
import { repositories } from '../database';
import { Expense, ExpenseInput, ExpenseFilters, PaginationParams } from 'shared';
import { NotFoundError } from '../utils/errors';

const { expense: expenseRepository, category: categoryRepository } = repositories;

/**
 * Service for expense management
 */
export class ExpenseService {
  /**
   * Get all expenses with optional filtering and pagination
   */
  async getExpenses(
    filters: ExpenseFilters,
    pagination: PaginationParams
  ): Promise<{ expenses: Expense[]; total: number }> {
    return expenseRepository.findWithFilters(filters, pagination);
  }
  
  /**
   * Get an expense by ID
   */
  async getExpenseById(id: string): Promise<Expense> {
    const expense = await expenseRepository.findById(id);
    
    if (!expense) {
      throw new NotFoundError(`Expense with ID ${id} not found`);
    }
    
    return expense;
  }
  
  /**
   * Create a new expense
   */
  async createExpense(data: ExpenseInput): Promise<Expense> {
    // Validate that the category exists
    const category = await categoryRepository.findById(data.category);
    
    if (!category) {
      throw new NotFoundError(`Category with ID ${data.category} not found`);
    }
    
    // Create the expense
    return expenseRepository.create(data);
  }
  
  /**
   * Update an existing expense
   */
  async updateExpense(id: string, data: Partial<ExpenseInput>): Promise<Expense> {
    // Validate that the expense exists
    const existingExpense = await expenseRepository.findById(id);
    
    if (!existingExpense) {
      throw new NotFoundError(`Expense with ID ${id} not found`);
    }
    
    // If category is being updated, validate that it exists
    if (data.category && data.category !== existingExpense.category) {
      const category = await categoryRepository.findById(data.category);
      
      if (!category) {
        throw new NotFoundError(`Category with ID ${data.category} not found`);
      }
    }
    
    // Update the expense
    const updatedExpense = await expenseRepository.update(id, data);
    
    if (!updatedExpense) {
      throw new NotFoundError(`Expense with ID ${id} not found`);
    }
    
    return updatedExpense;
  }
  
  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<void> {
    const deleted = await expenseRepository.deleteById(id);
    
    if (!deleted) {
      throw new NotFoundError(`Expense with ID ${id} not found`);
    }
  }
  
  /**
   * Get monthly summary (total by category)
   */
  async getMonthlySummary(month: string): Promise<{ category: string; total: number }[]> {
    return expenseRepository.getMonthlySummary(month);
  }
  
  /**
   * Get daily totals for a month
   */
  async getDailyTotals(month: string): Promise<{ date: string; total: number }[]> {
    return expenseRepository.getDailyTotals(month);
  }
  
  /**
   * Get monthly totals for a date range
   */
  async getMonthlyTotals(
    startMonth: string,
    endMonth: string
  ): Promise<{ month: string; total: number }[]> {
    return expenseRepository.getMonthlyTotals(startMonth, endMonth);
  }
  
  /**
   * Get expenses by category
   */
  async getExpensesByCategory(categoryId: string): Promise<Expense[]> {
    // Validate that the category exists
    const category = await categoryRepository.findById(categoryId);
    
    if (!category) {
      throw new NotFoundError(`Category with ID ${categoryId} not found`);
    }
    
    return expenseRepository.findByCategory(categoryId);
  }
  
  /**
   * Get expenses by month
   */
  async getExpensesByMonth(month: string): Promise<Expense[]> {
    return expenseRepository.findByMonth(month);
  }
}
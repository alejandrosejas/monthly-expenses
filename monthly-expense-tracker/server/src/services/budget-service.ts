import { repositories } from '../database';
import { Budget, BudgetInput } from 'shared';
import { NotFoundError } from '../utils/errors';

const { budget: budgetRepository, expense: expenseRepository, category: categoryRepository } = repositories;

/**
 * Service for budget management
 */
export class BudgetService {
  /**
   * Get a budget by month
   */
  async getBudgetByMonth(month: string): Promise<Budget | null> {
    return budgetRepository.findByMonth(month);
  }
  
  /**
   * Create or update a budget for a month
   */
  async createOrUpdateBudget(data: BudgetInput): Promise<Budget> {
    // Validate that all categories in categoryBudgets exist
    if (data.categoryBudgets) {
      for (const categoryId of Object.keys(data.categoryBudgets)) {
        const category = await categoryRepository.findById(categoryId);
        
        if (!category) {
          throw new NotFoundError(`Category with ID ${categoryId} not found`);
        }
      }
    }
    
    return budgetRepository.createOrUpdateForMonth(data.month, data);
  }
  
  /**
   * Delete a budget
   */
  async deleteBudget(id: string): Promise<void> {
    const deleted = await budgetRepository.deleteById(id);
    
    if (!deleted) {
      throw new NotFoundError(`Budget with ID ${id} not found`);
    }
  }
  
  /**
   * Get budget status with expenses for a month
   */
  async getBudgetStatus(month: string): Promise<{
    month: string;
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    percentageUsed: number;
    categories: Array<{
      categoryId: string;
      categoryName: string;
      budgeted: number;
      spent: number;
      remaining: number;
      percentage: number;
      status: 'normal' | 'warning' | 'exceeded';
    }>;
  }> {
    // Get budget for the month
    const budget = await budgetRepository.findByMonth(month);
    
    if (!budget) {
      // Return empty budget status if no budget exists
      return {
        month,
        totalBudget: 0,
        totalSpent: 0,
        totalRemaining: 0,
        percentageUsed: 0,
        categories: []
      };
    }
    
    // Get expenses for the month
    const expenses = await expenseRepository.findByMonth(month);
    
    // Calculate total spent
    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate remaining budget
    const totalRemaining = Math.max(0, budget.totalBudget - totalSpent);
    
    // Calculate percentage used
    const percentageUsed = budget.totalBudget > 0
      ? Math.round((totalSpent / budget.totalBudget) * 100)
      : 0;
    
    // Calculate category spending
    const categorySpending: Record<string, number> = {};
    expenses.forEach(expense => {
      if (!categorySpending[expense.category]) {
        categorySpending[expense.category] = 0;
      }
      categorySpending[expense.category] += expense.amount;
    });
    
    // Get all categories
    const allCategories = await categoryRepository.findAll();
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]));
    
    // Build category status
    const categories = await Promise.all(
      Object.entries(budget.categoryBudgets).map(async ([categoryId, budgetAmount]) => {
        const spent = categorySpending[categoryId] || 0;
        const remaining = Math.max(0, budgetAmount - spent);
        const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
        
        // Determine status based on percentage
        let status: 'normal' | 'warning' | 'exceeded' = 'normal';
        if (percentage >= 100) {
          status = 'exceeded';
        } else if (percentage >= 80) {
          status = 'warning';
        }
        
        // Get category name
        const categoryName = categoryMap.get(categoryId)?.name || 'Unknown Category';
        
        return {
          categoryId,
          categoryName,
          budgeted: budgetAmount,
          spent,
          remaining,
          percentage,
          status
        };
      })
    );
    
    // Build response
    return {
      month,
      totalBudget: budget.totalBudget,
      totalSpent,
      totalRemaining,
      percentageUsed,
      categories
    };
  }
  
  /**
   * Get budgets for a range of months
   */
  async getBudgetsByMonthRange(startMonth: string, endMonth: string): Promise<Budget[]> {
    return budgetRepository.findByMonthRange(startMonth, endMonth);
  }
}
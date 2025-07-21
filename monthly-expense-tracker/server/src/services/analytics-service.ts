import { CategoryBreakdown, MonthlyTotal, DailyTotal, MonthComparison, TrendAnalysis } from 'shared';
import { ExpenseRepository } from '../database/expense-repository';
import { CategoryRepository } from '../database/category-repository';
import { getMonthStart, getMonthEnd } from '../utils';

export class AnalyticsService {
  private expenseRepository: ExpenseRepository;
  private categoryRepository: CategoryRepository;

  constructor(
    expenseRepository: ExpenseRepository,
    categoryRepository: CategoryRepository
  ) {
    this.expenseRepository = expenseRepository;
    this.categoryRepository = categoryRepository;
  }

  /**
   * Get category breakdown for a specific month
   */
  async getCategoryBreakdown(month: string): Promise<CategoryBreakdown[]> {
    const startDate = getMonthStart(month);
    const endDate = getMonthEnd(month);
    
    // Get all expenses for the month
    const expenses = await this.expenseRepository.findByDateRange(startDate, endDate);
    
    // Get all categories
    const categories = await this.categoryRepository.findAll();
    
    // Calculate total amount for the month
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Group expenses by category
    const categoryMap = new Map<string, number>();
    expenses.forEach(expense => {
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
    });
    
    // Create category breakdown
    const breakdown: CategoryBreakdown[] = [];
    
    for (const [categoryName, amount] of categoryMap.entries()) {
      const category = categories.find(c => c.name === categoryName);
      const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
      
      breakdown.push({
        category: categoryName,
        amount,
        percentage,
        color: category?.color || '#808080' // Default gray color if category not found
      });
    }
    
    // Sort by amount descending
    return breakdown.sort((a, b) => b.amount - a.amount);
  }

  /**
   * Get monthly totals for the last 6 months
   */
  async getMonthlyTotals(endMonth: string, count = 6): Promise<MonthlyTotal[]> {
    // Calculate start month (6 months before end month)
    const endDate = new Date(`${endMonth}-01`);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - (count - 1));
    
    const startMonth = startDate.toISOString().substring(0, 7); // YYYY-MM format
    
    // Get all expenses for the date range
    const expenses = await this.expenseRepository.findByMonthRange(startMonth, endMonth);
    
    // Group expenses by month
    const monthlyTotals = new Map<string, number>();
    
    // Initialize all months with zero
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      date.setMonth(date.getMonth() + i);
      const monthKey = date.toISOString().substring(0, 7);
      monthlyTotals.set(monthKey, 0);
    }
    
    // Sum expenses by month
    expenses.forEach(expense => {
      const month = expense.date.substring(0, 7); // YYYY-MM
      const currentTotal = monthlyTotals.get(month) || 0;
      monthlyTotals.set(month, currentTotal + expense.amount);
    });
    
    // Convert to array and sort by month
    return Array.from(monthlyTotals.entries())
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Get daily totals for a specific month
   */
  async getDailyTotals(month: string): Promise<DailyTotal[]> {
    const startDate = getMonthStart(month);
    const endDate = getMonthEnd(month);
    
    // Get all expenses for the month
    const expenses = await this.expenseRepository.findByDateRange(startDate, endDate);
    
    // Group expenses by date
    const dailyTotals = new Map<string, number>();
    
    // Sum expenses by date
    expenses.forEach(expense => {
      const currentTotal = dailyTotals.get(expense.date) || 0;
      dailyTotals.set(expense.date, currentTotal + expense.amount);
    });
    
    // Convert to array and sort by date
    return Array.from(dailyTotals.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Compare expenses between two months
   */
  async compareMonths(currentMonth: string, previousMonth: string): Promise<MonthComparison[]> {
    // Get category breakdown for both months
    const currentBreakdown = await this.getCategoryBreakdown(currentMonth);
    const previousBreakdown = await this.getCategoryBreakdown(previousMonth);
    
    // Get all unique categories
    const allCategories = new Set<string>();
    currentBreakdown.forEach(item => allCategories.add(item.category));
    previousBreakdown.forEach(item => allCategories.add(item.category));
    
    // Create comparison data
    const comparison: MonthComparison[] = [];
    
    for (const category of allCategories) {
      const current = currentBreakdown.find(item => item.category === category);
      const previous = previousBreakdown.find(item => item.category === category);
      
      const currentAmount = current?.amount || 0;
      const previousAmount = previous?.amount || 0;
      const difference = currentAmount - previousAmount;
      
      // Calculate percentage change
      let percentageChange = 0;
      if (previousAmount > 0) {
        percentageChange = (difference / previousAmount) * 100;
      } else if (currentAmount > 0) {
        percentageChange = 100; // If previous is 0 and current is not, that's a 100% increase
      }
      
      comparison.push({
        category,
        currentMonth: {
          month: currentMonth,
          amount: currentAmount
        },
        previousMonth: {
          month: previousMonth,
          amount: previousAmount
        },
        difference,
        percentageChange
      });
    }
    
    // Sort by absolute difference descending
    return comparison.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  }

  /**
   * Get comprehensive trend analysis for a specific month
   */
  async getTrendAnalysis(currentMonth: string, months = 6): Promise<TrendAnalysis> {
    // Get monthly totals for the specified period
    const monthlyTotals = await this.getMonthlyTotals(currentMonth, months);
    
    if (monthlyTotals.length === 0) {
      throw new Error('No data available for trend analysis');
    }
    
    // Calculate basic statistics
    const totalSpending = monthlyTotals.reduce((sum, item) => sum + item.total, 0);
    const averageSpending = totalSpending / monthlyTotals.length;
    const currentMonthData = monthlyTotals[monthlyTotals.length - 1];
    
    // Calculate month-over-month changes
    const monthlyChanges = monthlyTotals.slice(1).map((item, index) => {
      const previousTotal = monthlyTotals[index].total;
      const change = item.total - previousTotal;
      const percentageChange = previousTotal > 0 ? (change / previousTotal) * 100 : 0;
      
      return {
        month: item.month,
        change,
        percentageChange
      };
    });
    
    // Calculate average monthly change
    const totalChange = monthlyChanges.reduce((sum, item) => sum + item.change, 0);
    const averageMonthlyChange = monthlyChanges.length > 0 ? totalChange / monthlyChanges.length : 0;
    
    // Calculate volatility (standard deviation of changes)
    const changeVariances = monthlyChanges.map(item => 
      Math.pow(item.change - averageMonthlyChange, 2)
    );
    const volatility = changeVariances.length > 0 
      ? Math.sqrt(changeVariances.reduce((sum, variance) => sum + variance, 0) / changeVariances.length)
      : 0;
    
    // Determine trend direction
    let trendDirection: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (monthlyTotals.length >= 3) {
      const recentMonths = monthlyTotals.slice(-3);
      const firstRecent = recentMonths[0].total;
      const lastRecent = recentMonths[recentMonths.length - 1].total;
      const trendThreshold = averageSpending * 0.1; // 10% of average spending
      
      if (lastRecent - firstRecent > trendThreshold) {
        trendDirection = 'increasing';
      } else if (firstRecent - lastRecent > trendThreshold) {
        trendDirection = 'decreasing';
      }
    }
    
    // Generate insights
    const insights: string[] = [];
    
    // Current month vs average
    const currentVsAverage = currentMonthData.total - averageSpending;
    const currentVsAveragePercent = (currentVsAverage / averageSpending) * 100;
    
    if (Math.abs(currentVsAveragePercent) > 15) {
      insights.push(
        `Current month spending is ${currentVsAveragePercent > 0 ? 'above' : 'below'} average by ${Math.abs(currentVsAveragePercent).toFixed(1)}%`
      );
    }
    
    // Volatility insights
    if (volatility > averageSpending * 0.2) {
      insights.push('Spending patterns show high volatility - consider budgeting for consistency');
    } else if (volatility < averageSpending * 0.05) {
      insights.push('Spending patterns are very consistent month-to-month');
    }
    
    // Trend insights
    if (trendDirection === 'increasing') {
      insights.push('Spending trend is increasing over recent months');
    } else if (trendDirection === 'decreasing') {
      insights.push('Spending trend is decreasing over recent months');
    }
    
    // Recent change insights
    if (monthlyChanges.length > 0) {
      const recentChange = monthlyChanges[monthlyChanges.length - 1];
      if (Math.abs(recentChange.percentageChange) > 20) {
        insights.push(
          `Significant ${recentChange.change > 0 ? 'increase' : 'decrease'} of ${Math.abs(recentChange.percentageChange).toFixed(1)}% from last month`
        );
      }
    }
    
    return {
      currentMonth: {
        month: currentMonthData.month,
        total: currentMonthData.total
      },
      averageSpending,
      monthlyChanges,
      trendDirection,
      averageMonthlyChange,
      volatility,
      insights
    };
  }
}
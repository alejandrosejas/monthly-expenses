import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from './base-repository';
import { Expense, ExpenseInput, ExpenseFilters, PaginationParams } from 'shared';

/**
 * Repository for expense data operations
 */
export class ExpenseRepository extends BaseRepository<Expense> {
  constructor() {
    super('expenses');
  }
  
  /**
   * Create a new expense
   */
  async create(data: ExpenseInput): Promise<Expense> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const expense: Expense = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
    
    await this.db.run(
      `INSERT INTO expenses (id, date, amount, category, description, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      expense.date,
      expense.amount,
      expense.category,
      expense.description,
      expense.paymentMethod,
      expense.createdAt,
      expense.updatedAt
    );
    
    return expense;
  }
  
  /**
   * Update an existing expense
   */
  async update(id: string, data: Partial<ExpenseInput>): Promise<Expense | null> {
    // Check if expense exists
    const existing = await this.findById(id);
    if (!existing) return null;
    
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    
    if (data.date !== undefined) {
      updates.push('date = ?');
      values.push(data.date);
    }
    
    if (data.amount !== undefined) {
      updates.push('amount = ?');
      values.push(data.amount);
    }
    
    if (data.category !== undefined) {
      updates.push('category = ?');
      values.push(data.category);
    }
    
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    
    if (data.paymentMethod !== undefined) {
      updates.push('payment_method = ?');
      values.push(data.paymentMethod);
    }
    
    if (updates.length === 0) {
      return existing;
    }
    
    // Always update the updated_at timestamp
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());
    
    // Add ID to values array for WHERE clause
    values.push(id);
    
    await this.db.run(
      `UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
    
    // Return updated expense
    return this.findById(id) as Promise<Expense>;
  }
  
  /**
   * Find expenses by month (YYYY-MM)
   */
  async findByMonth(month: string): Promise<Expense[]> {
    return this.db.all<Expense[]>(
      "SELECT * FROM expenses WHERE date LIKE ? || '-%' ORDER BY date DESC",
      month
    );
  }
  
  /**
   * Find expenses by category
   */
  async findByCategory(categoryId: string): Promise<Expense[]> {
    return this.db.all<Expense[]>(
      'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC',
      categoryId
    );
  }
  
  /**
   * Find expenses with filtering and pagination
   */
  async findWithFilters(
    filters: ExpenseFilters,
    pagination: PaginationParams
  ): Promise<{ expenses: Expense[]; total: number }> {
    const conditions: string[] = [];
    const params: any[] = [];
    
    // Apply date filters
    if (filters.startDate) {
      conditions.push('date >= ?');
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      conditions.push('date <= ?');
      params.push(filters.endDate);
    }
    
    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      const placeholders = filters.categories.map(() => '?').join(',');
      conditions.push(`category IN (${placeholders})`);
      params.push(...filters.categories);
    }
    
    // Apply amount filters
    if (filters.minAmount !== undefined) {
      conditions.push('amount >= ?');
      params.push(filters.minAmount);
    }
    
    if (filters.maxAmount !== undefined) {
      conditions.push('amount <= ?');
      params.push(filters.maxAmount);
    }
    
    // Apply payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      const placeholders = filters.paymentMethods.map(() => '?').join(',');
      conditions.push(`payment_method IN (${placeholders})`);
      params.push(...filters.paymentMethods);
    }
    
    // Apply search term
    if (filters.searchTerm) {
      conditions.push('(description LIKE ? OR category LIKE ?)');
      const searchPattern = `%${filters.searchTerm}%`;
      params.push(searchPattern, searchPattern);
    }
    
    // Build WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM expenses ${whereClause}`;
    const countResult = await this.db.get<{ count: number }>(countQuery, ...params);
    const total = countResult?.count || 0;
    
    // Calculate pagination
    const offset = (pagination.page - 1) * pagination.limit;
    
    // Get paginated results
    const query = `
      SELECT * FROM expenses
      ${whereClause}
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;
    
    const expenses = await this.db.all<Expense[]>(
      query,
      ...params,
      pagination.limit,
      offset
    );
    
    return { expenses, total };
  }
  
  /**
   * Get monthly summary (total by category)
   */
  async getMonthlySummary(month: string): Promise<{ category: string; total: number }[]> {
    return this.db.all<{ category: string; total: number }[]>(
      `SELECT category, SUM(amount) as total
       FROM expenses
       WHERE date LIKE ? || '-%'
       GROUP BY category
       ORDER BY total DESC`,
      month
    );
  }
  
  /**
   * Get daily totals for a month
   */
  async getDailyTotals(month: string): Promise<{ date: string; total: number }[]> {
    return this.db.all<{ date: string; total: number }[]>(
      `SELECT date, SUM(amount) as total
       FROM expenses
       WHERE date LIKE ? || '-%'
       GROUP BY date
       ORDER BY date`,
      month
    );
  }
  
  /**
   * Get monthly totals for a date range
   */
  async getMonthlyTotals(startMonth: string, endMonth: string): Promise<{ month: string; total: number }[]> {
    return this.db.all<{ month: string; total: number }[]>(
      `SELECT substr(date, 1, 7) as month, SUM(amount) as total
       FROM expenses
       WHERE substr(date, 1, 7) >= ? AND substr(date, 1, 7) <= ?
       GROUP BY month
       ORDER BY month`,
      startMonth,
      endMonth
    );
  }
  
  /**
   * Map database row to Expense object
   */
  private mapRowToExpense(row: any): Expense {
    return {
      id: row.id,
      date: row.date,
      amount: row.amount,
      category: row.category,
      description: row.description,
      paymentMethod: row.payment_method,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseRepository = void 0;
const uuid_1 = require("uuid");
const base_repository_1 = require("./base-repository");
/**
 * Repository for expense data operations
 */
class ExpenseRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('expenses');
    }
    /**
     * Create a new expense
     */
    async create(data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const expense = {
            id,
            ...data,
            createdAt: now,
            updatedAt: now
        };
        await this.db.run(`INSERT INTO expenses (id, date, amount, category, description, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, id, expense.date, expense.amount, expense.category, expense.description, expense.paymentMethod, expense.createdAt, expense.updatedAt);
        return expense;
    }
    /**
     * Update an existing expense
     */
    async update(id, data) {
        // Check if expense exists
        const existing = await this.findById(id);
        if (!existing)
            return null;
        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
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
        await this.db.run(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`, ...values);
        // Return updated expense
        return this.findById(id);
    }
    /**
     * Find expenses by month (YYYY-MM)
     */
    async findByMonth(month) {
        return this.db.all("SELECT * FROM expenses WHERE date LIKE ? || '-%' ORDER BY date DESC", month);
    }
    /**
     * Find expenses by category
     */
    async findByCategory(categoryId) {
        return this.db.all('SELECT * FROM expenses WHERE category = ? ORDER BY date DESC', categoryId);
    }
    /**
     * Find expenses with filtering and pagination
     */
    async findWithFilters(filters, pagination) {
        const conditions = [];
        const params = [];
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
        const countResult = await this.db.get(countQuery, ...params);
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
        const expenses = await this.db.all(query, ...params, pagination.limit, offset);
        return { expenses, total };
    }
    /**
     * Get monthly summary (total by category)
     */
    async getMonthlySummary(month) {
        return this.db.all(`SELECT category, SUM(amount) as total
       FROM expenses
       WHERE date LIKE ? || '-%'
       GROUP BY category
       ORDER BY total DESC`, month);
    }
    /**
     * Get daily totals for a month
     */
    async getDailyTotals(month) {
        return this.db.all(`SELECT date, SUM(amount) as total
       FROM expenses
       WHERE date LIKE ? || '-%'
       GROUP BY date
       ORDER BY date`, month);
    }
    /**
     * Get monthly totals for a date range
     */
    async getMonthlyTotals(startMonth, endMonth) {
        return this.db.all(`SELECT substr(date, 1, 7) as month, SUM(amount) as total
       FROM expenses
       WHERE substr(date, 1, 7) >= ? AND substr(date, 1, 7) <= ?
       GROUP BY month
       ORDER BY month`, startMonth, endMonth);
    }
    /**
     * Map database row to Expense object
     */
    mapRowToExpense(row) {
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
exports.ExpenseRepository = ExpenseRepository;

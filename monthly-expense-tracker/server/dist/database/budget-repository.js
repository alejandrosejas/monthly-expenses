"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetRepository = void 0;
const uuid_1 = require("uuid");
const base_repository_1 = require("./base-repository");
/**
 * Repository for budget data operations
 */
class BudgetRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('budgets');
    }
    /**
     * Create a new budget
     */
    async create(data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const budget = {
            id,
            ...data,
            createdAt: now,
            updatedAt: now
        };
        // Store category budgets as JSON string
        const categoryBudgetsJson = JSON.stringify(budget.categoryBudgets);
        await this.db.run(`INSERT INTO budgets (id, month, total_budget, category_budgets, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`, id, budget.month, budget.totalBudget, categoryBudgetsJson, budget.createdAt, budget.updatedAt);
        return budget;
    }
    /**
     * Update an existing budget
     */
    async update(id, data) {
        // Check if budget exists
        const existing = await this.findById(id);
        if (!existing)
            return null;
        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        if (data.month !== undefined) {
            updates.push('month = ?');
            values.push(data.month);
        }
        if (data.totalBudget !== undefined) {
            updates.push('total_budget = ?');
            values.push(data.totalBudget);
        }
        if (data.categoryBudgets !== undefined) {
            updates.push('category_budgets = ?');
            values.push(JSON.stringify(data.categoryBudgets));
        }
        if (updates.length === 0) {
            return existing;
        }
        // Always update the updated_at timestamp
        updates.push('updated_at = ?');
        values.push(new Date().toISOString());
        // Add ID to values array for WHERE clause
        values.push(id);
        await this.db.run(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`, ...values);
        // Return updated budget
        return this.findById(id);
    }
    /**
     * Find budget by month
     */
    async findByMonth(month) {
        const row = await this.db.get('SELECT * FROM budgets WHERE month = ?', month);
        if (!row)
            return undefined;
        return this.mapRowToBudget(row);
    }
    /**
     * Create or update a budget for a specific month
     */
    async createOrUpdateForMonth(month, data) {
        const existing = await this.findByMonth(month);
        if (existing) {
            // Update existing budget
            const updated = await this.update(existing.id, data);
            return updated;
        }
        else {
            // Create new budget
            return this.create({
                month,
                totalBudget: data.totalBudget || 0,
                categoryBudgets: data.categoryBudgets || {}
            });
        }
    }
    /**
     * Get budgets for a range of months
     */
    async findByMonthRange(startMonth, endMonth) {
        const rows = await this.db.all('SELECT * FROM budgets WHERE month >= ? AND month <= ? ORDER BY month', startMonth, endMonth);
        return rows.map(row => this.mapRowToBudget(row));
    }
    /**
     * Map database row to Budget object
     */
    mapRowToBudget(row) {
        return {
            id: row.id,
            month: row.month,
            totalBudget: row.total_budget,
            categoryBudgets: JSON.parse(row.category_budgets),
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
}
exports.BudgetRepository = BudgetRepository;

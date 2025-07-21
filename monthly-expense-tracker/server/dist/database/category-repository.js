"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const uuid_1 = require("uuid");
const base_repository_1 = require("./base-repository");
/**
 * Repository for category data operations
 */
class CategoryRepository extends base_repository_1.BaseRepository {
    constructor() {
        super('categories');
    }
    /**
     * Create a new category
     */
    async create(data) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const category = {
            id,
            ...data,
            isDefault: false,
            createdAt: now
        };
        await this.db.run(`INSERT INTO categories (id, name, color, is_default, created_at)
       VALUES (?, ?, ?, ?, ?)`, id, category.name, category.color, category.isDefault ? 1 : 0, category.createdAt);
        return category;
    }
    /**
     * Update an existing category
     */
    async update(id, data) {
        // Check if category exists
        const existing = await this.findById(id);
        if (!existing)
            return null;
        // Build update query dynamically based on provided fields
        const updates = [];
        const values = [];
        if (data.name !== undefined) {
            updates.push('name = ?');
            values.push(data.name);
        }
        if (data.color !== undefined) {
            updates.push('color = ?');
            values.push(data.color);
        }
        if (updates.length === 0) {
            return existing;
        }
        // Add ID to values array for WHERE clause
        values.push(id);
        await this.db.run(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, ...values);
        // Return updated category
        return this.findById(id);
    }
    /**
     * Find a category by name
     */
    async findByName(name) {
        return this.db.get('SELECT * FROM categories WHERE name = ?', name);
    }
    /**
     * Find all default categories
     */
    async findDefaultCategories() {
        return this.db.all('SELECT * FROM categories WHERE is_default = 1');
    }
    /**
     * Set a category as default
     */
    async setAsDefault(id, isDefault) {
        const result = await this.db.run('UPDATE categories SET is_default = ? WHERE id = ?', isDefault ? 1 : 0, id);
        return result.changes > 0;
    }
    /**
     * Get the default "Other" category for reassigning expenses
     */
    async getDefaultCategory() {
        return this.db.get("SELECT * FROM categories WHERE name = 'Other' AND is_default = 1");
    }
    /**
     * Reassign expenses from one category to another
     */
    async reassignExpenses(fromCategoryId, toCategoryId) {
        const result = await this.db.run('UPDATE expenses SET category = ? WHERE category = ?', toCategoryId, fromCategoryId);
        return result.changes || 0;
    }
    /**
     * Map database row to Category object
     */
    mapRowToCategory(row) {
        return {
            id: row.id,
            name: row.name,
            color: row.color,
            isDefault: row.is_default === 1,
            createdAt: row.created_at
        };
    }
}
exports.CategoryRepository = CategoryRepository;

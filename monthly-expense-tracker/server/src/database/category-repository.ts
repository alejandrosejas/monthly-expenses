import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from './base-repository';
import { Category, CategoryInput } from 'shared';

/**
 * Repository for category data operations
 */
export class CategoryRepository extends BaseRepository<Category> {
  constructor() {
    super('categories');
  }
  
  /**
   * Create a new category
   */
  async create(data: CategoryInput): Promise<Category> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const category: Category = {
      id,
      ...data,
      isDefault: false,
      createdAt: now
    };
    
    await this.db.run(
      `INSERT INTO categories (id, name, color, is_default, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      id,
      category.name,
      category.color,
      category.isDefault ? 1 : 0,
      category.createdAt
    );
    
    return category;
  }
  
  /**
   * Update an existing category
   */
  async update(id: string, data: Partial<CategoryInput>): Promise<Category | null> {
    // Check if category exists
    const existing = await this.findById(id);
    if (!existing) return null;
    
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    
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
    
    await this.db.run(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      ...values
    );
    
    // Return updated category
    return this.findById(id) as Promise<Category>;
  }
  
  /**
   * Find a category by name
   */
  async findByName(name: string): Promise<Category | undefined> {
    return this.db.get<Category>(
      'SELECT * FROM categories WHERE name = ?',
      name
    );
  }
  
  /**
   * Find all default categories
   */
  async findDefaultCategories(): Promise<Category[]> {
    return this.db.all<Category[]>(
      'SELECT * FROM categories WHERE is_default = 1'
    );
  }
  
  /**
   * Set a category as default
   */
  async setAsDefault(id: string, isDefault: boolean): Promise<boolean> {
    const result = await this.db.run(
      'UPDATE categories SET is_default = ? WHERE id = ?',
      isDefault ? 1 : 0,
      id
    );
    
    return result.changes > 0;
  }
  
  /**
   * Get the default "Other" category for reassigning expenses
   */
  async getDefaultCategory(): Promise<Category | undefined> {
    return this.db.get<Category>(
      "SELECT * FROM categories WHERE name = 'Other' AND is_default = 1"
    );
  }
  
  /**
   * Reassign expenses from one category to another
   */
  async reassignExpenses(fromCategoryId: string, toCategoryId: string): Promise<number> {
    const result = await this.db.run(
      'UPDATE expenses SET category = ? WHERE category = ?',
      toCategoryId,
      fromCategoryId
    );
    
    return result.changes || 0;
  }
  
  /**
   * Map database row to Category object
   */
  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      color: row.color,
      isDefault: row.is_default === 1,
      createdAt: row.created_at
    };
  }
}
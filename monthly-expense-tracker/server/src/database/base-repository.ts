import { Database } from 'sqlite';
import { getDatabase } from './connection';

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T> {
  protected tableName: string;
  protected db: Database;
  
  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = getDatabase();
  }
  
  /**
   * Find all records in the table
   */
  async findAll(): Promise<T[]> {
    return this.db.all<T[]>(`SELECT * FROM ${this.tableName}`);
  }
  
  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<T | undefined> {
    return this.db.get<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, id);
  }
  
  /**
   * Delete a record by ID
   */
  async deleteById(id: string): Promise<boolean> {
    const result = await this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, id);
    return result.changes > 0;
  }
  
  /**
   * Count records in the table
   */
  async count(): Promise<number> {
    const result = await this.db.get<{ count: number }>(`SELECT COUNT(*) as count FROM ${this.tableName}`);
    return result?.count || 0;
  }
}
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const connection_1 = require("./connection");
/**
 * Base repository class with common CRUD operations
 */
class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
        this.db = (0, connection_1.getDatabase)();
    }
    /**
     * Find all records in the table
     */
    async findAll() {
        return this.db.all(`SELECT * FROM ${this.tableName}`);
    }
    /**
     * Find a record by ID
     */
    async findById(id) {
        return this.db.get(`SELECT * FROM ${this.tableName} WHERE id = ?`, id);
    }
    /**
     * Delete a record by ID
     */
    async deleteById(id) {
        const result = await this.db.run(`DELETE FROM ${this.tableName} WHERE id = ?`, id);
        return result.changes > 0;
    }
    /**
     * Count records in the table
     */
    async count() {
        const result = await this.db.get(`SELECT COUNT(*) as count FROM ${this.tableName}`);
        return result?.count || 0;
    }
}
exports.BaseRepository = BaseRepository;

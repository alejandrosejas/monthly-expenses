"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.runMigrations = runMigrations;
exports.seedDatabase = seedDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure the data directory exists
const DATA_DIR = path_1.default.join(process.cwd(), 'data');
if (!fs_1.default.existsSync(DATA_DIR)) {
    fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
}
// Database file path
const DB_PATH = path_1.default.join(DATA_DIR, 'expenses.db');
// Singleton database connection
let db = null;
/**
 * Initialize the database connection
 */
async function initializeDatabase() {
    if (db)
        return db;
    // Open database connection
    db = await (0, sqlite_1.open)({
        filename: DB_PATH,
        driver: sqlite3_1.default.Database
    });
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON');
    console.log(`Connected to SQLite database at ${DB_PATH}`);
    return db;
}
/**
 * Get the database connection
 * @throws Error if database is not initialized
 */
function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}
/**
 * Close the database connection
 */
async function closeDatabase() {
    if (db) {
        await db.close();
        db = null;
        console.log('Database connection closed');
    }
}
/**
 * Run migrations to set up or update the database schema
 */
async function runMigrations() {
    const database = await initializeDatabase();
    console.log('Running database migrations...');
    // Create categories table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
    // Create expenses table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category) REFERENCES categories(id) ON DELETE CASCADE
    )
  `);
    // Create budgets table
    await database.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      month TEXT UNIQUE NOT NULL,
      total_budget REAL NOT NULL,
      category_budgets TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
    // Create indexes for common queries
    await database.exec(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
  `);
    console.log('Database migrations completed successfully');
}
/**
 * Seed the database with initial data (default categories)
 */
async function seedDatabase() {
    const database = await initializeDatabase();
    // Check if categories table is empty
    const count = await database.get('SELECT COUNT(*) as count FROM categories');
    if (count.count === 0) {
        console.log('Seeding database with default categories...');
        // Default categories with UUIDs
        const defaultCategories = [
            {
                id: '1f8e7a9b-3c5d-4e2f-8a9c-1d2e3f4a5b6c',
                name: 'Food & Dining',
                color: '#FF6B6B',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '2a1b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d',
                name: 'Transportation',
                color: '#4ECDC4',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '3b2c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e',
                name: 'Utilities',
                color: '#45B7D1',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '4c3d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
                name: 'Entertainment',
                color: '#96CEB4',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '5d4e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
                name: 'Healthcare',
                color: '#FFEAA7',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '6e5f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b',
                name: 'Shopping',
                color: '#DDA0DD',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '7f6a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c',
                name: 'Education',
                color: '#98D8C8',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '8a7b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d',
                name: 'Travel',
                color: '#F7DC6F',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '9b8c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e',
                name: 'Insurance',
                color: '#BB8FCE',
                is_default: 1,
                created_at: new Date().toISOString()
            },
            {
                id: '0c9d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
                name: 'Other',
                color: '#AED6F1',
                is_default: 1,
                created_at: new Date().toISOString()
            }
        ];
        // Insert default categories
        const insertStmt = await database.prepare(`
      INSERT INTO categories (id, name, color, is_default, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
        for (const category of defaultCategories) {
            await insertStmt.run(category.id, category.name, category.color, category.is_default, category.created_at);
        }
        await insertStmt.finalize();
        console.log('Database seeded successfully with default categories');
    }
    else {
        console.log('Database already contains categories, skipping seed');
    }
}

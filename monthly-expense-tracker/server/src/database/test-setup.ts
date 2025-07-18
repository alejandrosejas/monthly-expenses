import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';
import fs from 'fs';

// In-memory database for testing
let testDb: Database | null = null;

/**
 * Initialize an in-memory test database
 */
export async function initTestDatabase(): Promise<Database> {
  if (testDb) return testDb;
  
  // Open in-memory database
  testDb = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });
  
  // Enable foreign keys
  await testDb.exec('PRAGMA foreign_keys = ON');
  
  // Create test schema
  await createTestSchema(testDb);
  
  return testDb;
}

/**
 * Create test schema
 */
async function createTestSchema(db: Database): Promise<void> {
  // Create categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      color TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )
  `);
  
  // Create expenses table
  await db.exec(`
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
  await db.exec(`
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
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
  `);
}

/**
 * Close the test database
 */
export async function closeTestDatabase(): Promise<void> {
  if (testDb) {
    await testDb.close();
    testDb = null;
  }
}

/**
 * Get the test database instance
 */
export function getTestDatabase(): Database {
  if (!testDb) {
    throw new Error('Test database not initialized');
  }
  return testDb;
}

/**
 * Clear all data from test database tables
 */
export async function clearTestDatabase(): Promise<void> {
  if (!testDb) return;
  
  await testDb.exec('DELETE FROM expenses');
  await testDb.exec('DELETE FROM budgets');
  await testDb.exec('DELETE FROM categories');
}

/**
 * Seed test database with sample data
 */
export async function seedTestData(): Promise<void> {
  if (!testDb) return;
  
  // Sample categories
  const categories = [
    {
      id: 'cat-1',
      name: 'Food',
      color: '#FF0000',
      is_default: 1,
      created_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'cat-2',
      name: 'Transportation',
      color: '#00FF00',
      is_default: 1,
      created_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 'cat-3',
      name: 'Other',
      color: '#0000FF',
      is_default: 1,
      created_at: '2023-01-01T00:00:00Z'
    }
  ];
  
  // Insert categories
  for (const category of categories) {
    await testDb.run(
      'INSERT INTO categories (id, name, color, is_default, created_at) VALUES (?, ?, ?, ?, ?)',
      category.id,
      category.name,
      category.color,
      category.is_default,
      category.created_at
    );
  }
  
  // Sample expenses
  const expenses = [
    {
      id: 'exp-1',
      date: '2023-01-15',
      amount: 25.50,
      category: 'cat-1',
      description: 'Lunch',
      payment_method: 'credit',
      created_at: '2023-01-15T12:00:00Z',
      updated_at: '2023-01-15T12:00:00Z'
    },
    {
      id: 'exp-2',
      date: '2023-01-16',
      amount: 35.00,
      category: 'cat-2',
      description: 'Gas',
      payment_method: 'debit',
      created_at: '2023-01-16T12:00:00Z',
      updated_at: '2023-01-16T12:00:00Z'
    },
    {
      id: 'exp-3',
      date: '2023-02-01',
      amount: 15.75,
      category: 'cat-1',
      description: 'Coffee',
      payment_method: 'cash',
      created_at: '2023-02-01T12:00:00Z',
      updated_at: '2023-02-01T12:00:00Z'
    }
  ];
  
  // Insert expenses
  for (const expense of expenses) {
    await testDb.run(
      `INSERT INTO expenses 
       (id, date, amount, category, description, payment_method, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      expense.id,
      expense.date,
      expense.amount,
      expense.category,
      expense.description,
      expense.payment_method,
      expense.created_at,
      expense.updated_at
    );
  }
  
  // Sample budget
  const budget = {
    id: 'budget-1',
    month: '2023-01',
    total_budget: 500.00,
    category_budgets: JSON.stringify({
      'cat-1': 200.00,
      'cat-2': 150.00
    }),
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };
  
  // Insert budget
  await testDb.run(
    `INSERT INTO budgets
     (id, month, total_budget, category_budgets, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    budget.id,
    budget.month,
    budget.total_budget,
    budget.category_budgets,
    budget.created_at,
    budget.updated_at
  );
}
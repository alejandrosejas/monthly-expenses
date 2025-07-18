import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { ExpenseRepository } from './expense-repository';
import { 
  initTestDatabase, 
  closeTestDatabase, 
  clearTestDatabase, 
  seedTestData,
  getTestDatabase
} from './test-setup';

describe('ExpenseRepository', () => {
  let repository: ExpenseRepository;
  
  // Setup test database before all tests
  beforeAll(async () => {
    await initTestDatabase();
    // Mock the getDatabase function to return the test database
    vi.mock('./connection', () => ({
      getDatabase: () => getTestDatabase()
    }));
    repository = new ExpenseRepository();
  });
  
  // Clean up after all tests
  afterAll(async () => {
    await closeTestDatabase();
  });
  
  // Reset data before each test
  beforeEach(async () => {
    await clearTestDatabase();
    await seedTestData();
  });
  
  it('should find all expenses', async () => {
    const expenses = await repository.findAll();
    expect(expenses).toHaveLength(3);
  });
  
  it('should find an expense by ID', async () => {
    const expense = await repository.findById('exp-1');
    expect(expense).toBeDefined();
    expect(expense?.amount).toBe(25.50);
    expect(expense?.description).toBe('Lunch');
    expect(expense?.category).toBe('cat-1');
  });
  
  it('should create a new expense', async () => {
    const newExpense = await repository.create({
      date: '2023-02-15',
      amount: 45.75,
      category: 'cat-2',
      description: 'Train ticket',
      paymentMethod: 'credit'
    });
    
    expect(newExpense).toBeDefined();
    expect(newExpense.id).toBeDefined();
    expect(newExpense.date).toBe('2023-02-15');
    expect(newExpense.amount).toBe(45.75);
    expect(newExpense.category).toBe('cat-2');
    expect(newExpense.description).toBe('Train ticket');
    expect(newExpense.paymentMethod).toBe('credit');
    expect(newExpense.createdAt).toBeDefined();
    expect(newExpense.updatedAt).toBeDefined();
    
    // Verify it was saved to the database
    const found = await repository.findById(newExpense.id);
    expect(found).toBeDefined();
    expect(found?.description).toBe('Train ticket');
  });
  
  it('should update an existing expense', async () => {
    const updated = await repository.update('exp-1', {
      amount: 30.00,
      description: 'Lunch with colleagues'
    });
    
    expect(updated).toBeDefined();
    expect(updated?.id).toBe('exp-1');
    expect(updated?.amount).toBe(30.00);
    expect(updated?.description).toBe('Lunch with colleagues');
    
    // Verify it was updated in the database
    const found = await repository.findById('exp-1');
    expect(found?.amount).toBe(30.00);
    expect(found?.description).toBe('Lunch with colleagues');
  });
  
  it('should return null when updating non-existent expense', async () => {
    const result = await repository.update('non-existent', {
      amount: 50.00
    });
    
    expect(result).toBeNull();
  });
  
  it('should delete an expense', async () => {
    const result = await repository.deleteById('exp-2');
    expect(result).toBe(true);
    
    // Verify it was deleted
    const found = await repository.findById('exp-2');
    expect(found).toBeUndefined();
  });
  
  it('should find expenses by month', async () => {
    const expenses = await repository.findByMonth('2023-01');
    expect(expenses).toHaveLength(2);
    expect(expenses.every(exp => exp.date.startsWith('2023-01'))).toBe(true);
  });
  
  it('should find expenses by category', async () => {
    const expenses = await repository.findByCategory('cat-1');
    expect(expenses).toHaveLength(2);
    expect(expenses.every(exp => exp.category === 'cat-1')).toBe(true);
  });
  
  it('should find expenses with filters', async () => {
    // Test date range filter
    const dateFiltered = await repository.findWithFilters(
      { startDate: '2023-01-01', endDate: '2023-01-31' },
      { page: 1, limit: 10 }
    );
    expect(dateFiltered.expenses).toHaveLength(2);
    expect(dateFiltered.total).toBe(2);
    
    // Test category filter
    const categoryFiltered = await repository.findWithFilters(
      { categories: ['cat-1'] },
      { page: 1, limit: 10 }
    );
    expect(categoryFiltered.expenses).toHaveLength(2);
    expect(categoryFiltered.total).toBe(2);
    
    // Test amount filter
    const amountFiltered = await repository.findWithFilters(
      { minAmount: 30, maxAmount: 40 },
      { page: 1, limit: 10 }
    );
    expect(amountFiltered.expenses).toHaveLength(1);
    expect(amountFiltered.expenses[0].amount).toBe(35.00);
    
    // Test payment method filter
    const paymentFiltered = await repository.findWithFilters(
      { paymentMethods: ['credit'] },
      { page: 1, limit: 10 }
    );
    expect(paymentFiltered.expenses).toHaveLength(1);
    expect(paymentFiltered.expenses[0].paymentMethod).toBe('credit');
    
    // Test search term
    const searchFiltered = await repository.findWithFilters(
      { searchTerm: 'lunch' },
      { page: 1, limit: 10 }
    );
    expect(searchFiltered.expenses).toHaveLength(1);
    expect(searchFiltered.expenses[0].description).toBe('Lunch');
    
    // Test pagination
    const paginated = await repository.findWithFilters(
      {},
      { page: 1, limit: 2 }
    );
    expect(paginated.expenses).toHaveLength(2);
    expect(paginated.total).toBe(3);
  });
  
  it('should get monthly summary', async () => {
    const summary = await repository.getMonthlySummary('2023-01');
    expect(summary).toHaveLength(2);
    
    // Find Food category summary
    const foodSummary = summary.find(s => s.category === 'cat-1');
    expect(foodSummary).toBeDefined();
    expect(foodSummary?.total).toBe(25.50);
    
    // Find Transportation category summary
    const transportSummary = summary.find(s => s.category === 'cat-2');
    expect(transportSummary).toBeDefined();
    expect(transportSummary?.total).toBe(35.00);
  });
  
  it('should get daily totals', async () => {
    const dailyTotals = await repository.getDailyTotals('2023-01');
    expect(dailyTotals).toHaveLength(2);
    
    // Check specific dates
    const jan15 = dailyTotals.find(d => d.date === '2023-01-15');
    expect(jan15).toBeDefined();
    expect(jan15?.total).toBe(25.50);
    
    const jan16 = dailyTotals.find(d => d.date === '2023-01-16');
    expect(jan16).toBeDefined();
    expect(jan16?.total).toBe(35.00);
  });
  
  it('should get monthly totals', async () => {
    const monthlyTotals = await repository.getMonthlyTotals('2023-01', '2023-02');
    expect(monthlyTotals).toHaveLength(2);
    
    // Check specific months
    const jan = monthlyTotals.find(m => m.month === '2023-01');
    expect(jan).toBeDefined();
    expect(jan?.total).toBe(60.50); // 25.50 + 35.00
    
    const feb = monthlyTotals.find(m => m.month === '2023-02');
    expect(feb).toBeDefined();
    expect(feb?.total).toBe(15.75);
  });
});
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { BudgetRepository } from './budget-repository';
import { 
  initTestDatabase, 
  closeTestDatabase, 
  clearTestDatabase, 
  seedTestData,
  getTestDatabase
} from './test-setup';

describe('BudgetRepository', () => {
  let repository: BudgetRepository;
  
  // Setup test database before all tests
  beforeAll(async () => {
    await initTestDatabase();
    // Mock the getDatabase function to return the test database
    vi.mock('./connection', () => ({
      getDatabase: () => getTestDatabase()
    }));
    repository = new BudgetRepository();
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
  
  it('should find all budgets', async () => {
    const budgets = await repository.findAll();
    expect(budgets).toHaveLength(1);
    expect(budgets[0].month).toBe('2023-01');
  });
  
  it('should find a budget by ID', async () => {
    const budget = await repository.findById('budget-1');
    expect(budget).toBeDefined();
    expect(budget?.month).toBe('2023-01');
    expect(budget?.totalBudget).toBe(500.00);
    expect(budget?.categoryBudgets).toEqual({
      'cat-1': 200.00,
      'cat-2': 150.00
    });
  });
  
  it('should find a budget by month', async () => {
    const budget = await repository.findByMonth('2023-01');
    expect(budget).toBeDefined();
    expect(budget?.id).toBe('budget-1');
    expect(budget?.totalBudget).toBe(500.00);
  });
  
  it('should create a new budget', async () => {
    const newBudget = await repository.create({
      month: '2023-02',
      totalBudget: 600.00,
      categoryBudgets: {
        'cat-1': 250.00,
        'cat-2': 200.00
      }
    });
    
    expect(newBudget).toBeDefined();
    expect(newBudget.id).toBeDefined();
    expect(newBudget.month).toBe('2023-02');
    expect(newBudget.totalBudget).toBe(600.00);
    expect(newBudget.categoryBudgets).toEqual({
      'cat-1': 250.00,
      'cat-2': 200.00
    });
    expect(newBudget.createdAt).toBeDefined();
    expect(newBudget.updatedAt).toBeDefined();
    
    // Verify it was saved to the database
    const found = await repository.findById(newBudget.id);
    expect(found).toBeDefined();
    expect(found?.month).toBe('2023-02');
  });
  
  it('should update an existing budget', async () => {
    const updated = await repository.update('budget-1', {
      totalBudget: 550.00,
      categoryBudgets: {
        'cat-1': 250.00,
        'cat-2': 200.00
      }
    });
    
    expect(updated).toBeDefined();
    expect(updated?.id).toBe('budget-1');
    expect(updated?.totalBudget).toBe(550.00);
    expect(updated?.categoryBudgets).toEqual({
      'cat-1': 250.00,
      'cat-2': 200.00
    });
    
    // Verify it was updated in the database
    const found = await repository.findById('budget-1');
    expect(found?.totalBudget).toBe(550.00);
  });
  
  it('should return null when updating non-existent budget', async () => {
    const result = await repository.update('non-existent', {
      totalBudget: 600.00
    });
    
    expect(result).toBeNull();
  });
  
  it('should delete a budget', async () => {
    const result = await repository.deleteById('budget-1');
    expect(result).toBe(true);
    
    // Verify it was deleted
    const found = await repository.findById('budget-1');
    expect(found).toBeUndefined();
  });
  
  it('should create a new budget when createOrUpdateForMonth is called for non-existent month', async () => {
    const budget = await repository.createOrUpdateForMonth('2023-03', {
      totalBudget: 700.00,
      categoryBudgets: {
        'cat-1': 300.00,
        'cat-2': 250.00
      }
    });
    
    expect(budget).toBeDefined();
    expect(budget.month).toBe('2023-03');
    expect(budget.totalBudget).toBe(700.00);
    
    // Verify it was saved to the database
    const found = await repository.findByMonth('2023-03');
    expect(found).toBeDefined();
  });
  
  it('should update an existing budget when createOrUpdateForMonth is called for existing month', async () => {
    const budget = await repository.createOrUpdateForMonth('2023-01', {
      totalBudget: 600.00
    });
    
    expect(budget).toBeDefined();
    expect(budget.month).toBe('2023-01');
    expect(budget.totalBudget).toBe(600.00);
    
    // Original category budgets should be preserved
    expect(budget.categoryBudgets).toEqual({
      'cat-1': 200.00,
      'cat-2': 150.00
    });
  });
  
  it('should find budgets by month range', async () => {
    // Create another budget for testing
    await repository.create({
      month: '2023-02',
      totalBudget: 600.00,
      categoryBudgets: {}
    });
    
    const budgets = await repository.findByMonthRange('2023-01', '2023-02');
    expect(budgets).toHaveLength(2);
    expect(budgets[0].month).toBe('2023-01');
    expect(budgets[1].month).toBe('2023-02');
  });
});
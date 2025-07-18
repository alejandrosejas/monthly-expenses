import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { CategoryRepository } from './category-repository';
import { 
  initTestDatabase, 
  closeTestDatabase, 
  clearTestDatabase, 
  seedTestData,
  getTestDatabase
} from './test-setup';

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  
  // Setup test database before all tests
  beforeAll(async () => {
    await initTestDatabase();
    // Mock the getDatabase function to return the test database
    vi.mock('./connection', () => ({
      getDatabase: () => getTestDatabase()
    }));
    repository = new CategoryRepository();
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
  
  it('should find all categories', async () => {
    const categories = await repository.findAll();
    expect(categories).toHaveLength(3);
    expect(categories[0].name).toBe('Food');
    expect(categories[1].name).toBe('Transportation');
    expect(categories[2].name).toBe('Other');
  });
  
  it('should find a category by ID', async () => {
    const category = await repository.findById('cat-1');
    expect(category).toBeDefined();
    expect(category?.name).toBe('Food');
    expect(category?.color).toBe('#FF0000');
    expect(category?.isDefault).toBe(true);
  });
  
  it('should find a category by name', async () => {
    const category = await repository.findByName('Transportation');
    expect(category).toBeDefined();
    expect(category?.id).toBe('cat-2');
    expect(category?.color).toBe('#00FF00');
  });
  
  it('should create a new category', async () => {
    const newCategory = await repository.create({
      name: 'Entertainment',
      color: '#FFFF00'
    });
    
    expect(newCategory).toBeDefined();
    expect(newCategory.id).toBeDefined();
    expect(newCategory.name).toBe('Entertainment');
    expect(newCategory.color).toBe('#FFFF00');
    expect(newCategory.isDefault).toBe(false);
    expect(newCategory.createdAt).toBeDefined();
    
    // Verify it was saved to the database
    const found = await repository.findById(newCategory.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Entertainment');
  });
  
  it('should update an existing category', async () => {
    const updated = await repository.update('cat-1', {
      name: 'Food & Dining',
      color: '#FF5500'
    });
    
    expect(updated).toBeDefined();
    expect(updated?.id).toBe('cat-1');
    expect(updated?.name).toBe('Food & Dining');
    expect(updated?.color).toBe('#FF5500');
    
    // Verify it was updated in the database
    const found = await repository.findById('cat-1');
    expect(found?.name).toBe('Food & Dining');
    expect(found?.color).toBe('#FF5500');
  });
  
  it('should return null when updating non-existent category', async () => {
    const result = await repository.update('non-existent', {
      name: 'Test',
      color: '#000000'
    });
    
    expect(result).toBeNull();
  });
  
  it('should delete a category', async () => {
    const result = await repository.deleteById('cat-2');
    expect(result).toBe(true);
    
    // Verify it was deleted
    const found = await repository.findById('cat-2');
    expect(found).toBeUndefined();
  });
  
  it('should find default categories', async () => {
    const defaults = await repository.findDefaultCategories();
    expect(defaults).toHaveLength(3);
    expect(defaults.every(cat => cat.isDefault)).toBe(true);
  });
  
  it('should set a category as default', async () => {
    // Create a non-default category
    const newCategory = await repository.create({
      name: 'Entertainment',
      color: '#FFFF00'
    });
    
    // Set it as default
    const result = await repository.setAsDefault(newCategory.id, true);
    expect(result).toBe(true);
    
    // Verify it was updated
    const found = await repository.findById(newCategory.id);
    expect(found?.isDefault).toBe(true);
  });
  
  it('should get the default "Other" category', async () => {
    const other = await repository.getDefaultCategory();
    expect(other).toBeDefined();
    expect(other?.name).toBe('Other');
    expect(other?.isDefault).toBe(true);
  });
  
  it('should reassign expenses from one category to another', async () => {
    // First, verify we have expenses in cat-1
    const db = getTestDatabase();
    const beforeCount = await db.get(
      'SELECT COUNT(*) as count FROM expenses WHERE category = ?',
      'cat-1'
    );
    expect(beforeCount.count).toBeGreaterThan(0);
    
    // Reassign expenses
    const count = await repository.reassignExpenses('cat-1', 'cat-3');
    expect(count).toBeGreaterThan(0);
    
    // Verify expenses were reassigned
    const afterCount = await db.get(
      'SELECT COUNT(*) as count FROM expenses WHERE category = ?',
      'cat-1'
    );
    expect(afterCount.count).toBe(0);
    
    const newCount = await db.get(
      'SELECT COUNT(*) as count FROM expenses WHERE category = ?',
      'cat-3'
    );
    expect(newCount.count).toBeGreaterThan(0);
  });
});
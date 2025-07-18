import { repositories } from '../database';
import { Category, CategoryInput } from 'shared';
import { NotFoundError, ConflictError } from '../utils/errors';
import { generateColorFromString } from '../utils/color-utils';

const { category: categoryRepository } = repositories;

/**
 * Service for category management
 */
export class CategoryService {
  /**
   * Get all categories
   */
  async getAllCategories(): Promise<Category[]> {
    return categoryRepository.findAll();
  }
  
  /**
   * Get a category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    
    return category;
  }
  
  /**
   * Create a new category
   */
  async createCategory(data: CategoryInput): Promise<Category> {
    // Check if a category with the same name already exists
    const existing = await categoryRepository.findByName(data.name);
    
    if (existing) {
      throw new ConflictError(`Category with name '${data.name}' already exists`);
    }
    
    // Generate a color if not provided
    if (!data.color) {
      data.color = generateColorFromString(data.name);
    }
    
    return categoryRepository.create(data);
  }
  
  /**
   * Update an existing category
   */
  async updateCategory(id: string, data: Partial<CategoryInput>): Promise<Category> {
    // Validate that the category exists
    const existingCategory = await categoryRepository.findById(id);
    
    if (!existingCategory) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    
    // If name is being updated, check for duplicates
    if (data.name && data.name !== existingCategory.name) {
      const nameExists = await categoryRepository.findByName(data.name);
      
      if (nameExists) {
        throw new ConflictError(`Category with name '${data.name}' already exists`);
      }
    }
    
    // Update the category
    const updatedCategory = await categoryRepository.update(id, data);
    
    if (!updatedCategory) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    
    return updatedCategory;
  }
  
  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<void> {
    // Check if the category is a default category
    const category = await categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    
    if (category.isDefault) {
      throw new ConflictError('Cannot delete a default category');
    }
    
    // Get the default "Other" category for reassigning expenses
    const defaultCategory = await categoryRepository.getDefaultCategory();
    
    if (!defaultCategory) {
      throw new Error('Default category not found');
    }
    
    // Reassign expenses to the default category
    await categoryRepository.reassignExpenses(id, defaultCategory.id);
    
    // Delete the category
    const deleted = await categoryRepository.deleteById(id);
    
    if (!deleted) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
  }
  
  /**
   * Get default categories
   */
  async getDefaultCategories(): Promise<Category[]> {
    return categoryRepository.findDefaultCategories();
  }
  
  /**
   * Set a category as default
   */
  async setCategoryAsDefault(id: string, isDefault: boolean): Promise<Category> {
    // Validate that the category exists
    const category = await categoryRepository.findById(id);
    
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    
    // Set as default
    await categoryRepository.setAsDefault(id, isDefault);
    
    // Return updated category
    return this.getCategoryById(id);
  }
}
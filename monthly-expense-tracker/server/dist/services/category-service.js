"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const database_1 = require("../database");
const errors_1 = require("../utils/errors");
const color_utils_1 = require("../utils/color-utils");
const { category: categoryRepository } = database_1.repositories;
/**
 * Service for category management
 */
class CategoryService {
    /**
     * Get all categories
     */
    async getAllCategories() {
        return categoryRepository.findAll();
    }
    /**
     * Get a category by ID
     */
    async getCategoryById(id) {
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new errors_1.NotFoundError(`Category with ID ${id} not found`);
        }
        return category;
    }
    /**
     * Create a new category
     */
    async createCategory(data) {
        // Check if a category with the same name already exists
        const existing = await categoryRepository.findByName(data.name);
        if (existing) {
            throw new errors_1.ConflictError(`Category with name '${data.name}' already exists`);
        }
        // Generate a color if not provided
        if (!data.color) {
            data.color = (0, color_utils_1.generateColorFromString)(data.name);
        }
        return categoryRepository.create(data);
    }
    /**
     * Update an existing category
     */
    async updateCategory(id, data) {
        // Validate that the category exists
        const existingCategory = await categoryRepository.findById(id);
        if (!existingCategory) {
            throw new errors_1.NotFoundError(`Category with ID ${id} not found`);
        }
        // If name is being updated, check for duplicates
        if (data.name && data.name !== existingCategory.name) {
            const nameExists = await categoryRepository.findByName(data.name);
            if (nameExists) {
                throw new errors_1.ConflictError(`Category with name '${data.name}' already exists`);
            }
        }
        // Update the category
        const updatedCategory = await categoryRepository.update(id, data);
        if (!updatedCategory) {
            throw new errors_1.NotFoundError(`Category with ID ${id} not found`);
        }
        return updatedCategory;
    }
    /**
     * Delete a category
     */
    async deleteCategory(id) {
        // Check if the category is a default category
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new errors_1.NotFoundError(`Category with ID ${id} not found`);
        }
        if (category.isDefault) {
            throw new errors_1.ConflictError('Cannot delete a default category');
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
            throw new errors_1.NotFoundError(`Category with ID ${id} not found`);
        }
    }
    /**
     * Get default categories
     */
    async getDefaultCategories() {
        return categoryRepository.findDefaultCategories();
    }
    /**
     * Set a category as default
     */
    async setCategoryAsDefault(id, isDefault) {
        // Validate that the category exists
        const category = await categoryRepository.findById(id);
        if (!category) {
            throw new errors_1.NotFoundError(`Category with ID ${id} not found`);
        }
        // Set as default
        await categoryRepository.setAsDefault(id, isDefault);
        // Return updated category
        return this.getCategoryById(id);
    }
}
exports.CategoryService = CategoryService;

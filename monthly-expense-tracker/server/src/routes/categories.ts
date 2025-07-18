import { Router } from 'express';
import { services } from '../services';
import { sendSuccess, sendCreated, sendNoContent } from '../utils';
import { validateRequest } from '../middleware';
import { CategorySchema } from 'shared';
import { z } from 'zod';

const router = Router();
const categoryService = services.category;

// Schema for setting default status
const DefaultSchema = z.object({
  isDefault: z.boolean()
});

/**
 * @route GET /api/categories
 * @desc Get all categories
 * @access Public
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    return sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/categories/defaults
 * @desc Get default categories
 * @access Public
 */
router.get('/defaults', async (req, res, next) => {
  try {
    const defaultCategories = await categoryService.getDefaultCategories();
    return sendSuccess(res, defaultCategories);
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/categories/:id
 * @desc Get a category by ID
 * @access Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(id);
    return sendSuccess(res, category);
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/categories
 * @desc Create a new category
 * @access Public
 */
router.post('/', validateRequest(CategorySchema), async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/categories/:id
 * @desc Update a category
 * @access Public
 */
router.put('/:id', validateRequest(CategorySchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedCategory = await categoryService.updateCategory(id, req.body);
    return sendSuccess(res, updatedCategory, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
});

/**
 * @route DELETE /api/categories/:id
 * @desc Delete a category
 * @access Public
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    return sendNoContent(res);
  } catch (error) {
    next(error);
  }
});

/**
 * @route PATCH /api/categories/:id/default
 * @desc Set a category as default
 * @access Public
 */
router.patch('/:id/default', validateRequest(DefaultSchema, 'body'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;
    
    const updatedCategory = await categoryService.setCategoryAsDefault(id, isDefault);
    return sendSuccess(
      res,
      updatedCategory,
      `Category ${isDefault ? 'set as' : 'removed from'} default successfully`
    );
  } catch (error) {
    next(error);
  }
});

export default router;
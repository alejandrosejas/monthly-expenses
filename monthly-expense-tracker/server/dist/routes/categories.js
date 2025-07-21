"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_1 = require("../services");
const utils_1 = require("../utils");
const middleware_1 = require("../middleware");
const shared_1 = require("shared");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const categoryService = services_1.services.category;
// Schema for setting default status
const DefaultSchema = zod_1.z.object({
    isDefault: zod_1.z.boolean()
});
/**
 * @route GET /api/categories
 * @desc Get all categories
 * @access Public
 */
router.get('/', async (req, res, next) => {
    try {
        const categories = await categoryService.getAllCategories();
        return (0, utils_1.sendSuccess)(res, categories);
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, defaultCategories);
    }
    catch (error) {
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
        return (0, utils_1.sendSuccess)(res, category);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route POST /api/categories
 * @desc Create a new category
 * @access Public
 */
router.post('/', (0, middleware_1.validateRequest)(shared_1.CategorySchema), async (req, res, next) => {
    try {
        const category = await categoryService.createCategory(req.body);
        return (0, utils_1.sendCreated)(res, category, 'Category created successfully');
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PUT /api/categories/:id
 * @desc Update a category
 * @access Public
 */
router.put('/:id', (0, middleware_1.validateRequest)(shared_1.CategorySchema), async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedCategory = await categoryService.updateCategory(id, req.body);
        return (0, utils_1.sendSuccess)(res, updatedCategory, 'Category updated successfully');
    }
    catch (error) {
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
        return (0, utils_1.sendNoContent)(res);
    }
    catch (error) {
        next(error);
    }
});
/**
 * @route PATCH /api/categories/:id/default
 * @desc Set a category as default
 * @access Public
 */
router.patch('/:id/default', (0, middleware_1.validateRequest)(DefaultSchema, 'body'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isDefault } = req.body;
        const updatedCategory = await categoryService.setCategoryAsDefault(id, isDefault);
        return (0, utils_1.sendSuccess)(res, updatedCategory, `Category ${isDefault ? 'set as' : 'removed from'} default successfully`);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;

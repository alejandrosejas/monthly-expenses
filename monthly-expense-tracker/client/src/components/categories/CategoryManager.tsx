import React, { useState, useEffect } from 'react';
import { Category, CategoryInput } from 'shared';
import Button from '../common/Button';
import { useToast } from '../common/Toast';
import api from '../../services/api';

interface CategoryManagerProps {
  categories: Category[];
  onCategoryChange: () => void;
}

interface CategoryFormData {
  name: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
];

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onCategoryChange }) => {
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    color: DEFAULT_COLORS[0]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset form when editing category changes
  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        color: editingCategory.color
      });
    } else {
      setFormData({
        name: '',
        color: DEFAULT_COLORS[0]
      });
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const categoryData: CategoryInput = {
        name: formData.name.trim(),
        color: formData.color
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryData);
        addToast('Category updated successfully', 'success');
      } else {
        await api.post('/categories', categoryData);
        addToast('Category created successfully', 'success');
      }

      // Reset form and close
      setFormData({ name: '', color: DEFAULT_COLORS[0] });
      setEditingCategory(null);
      setShowForm(false);
      onCategoryChange();
    } catch (error: any) {
      addToast(error.message || 'Failed to save category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    setIsDeleting(true);
    
    try {
      await api.delete(`/categories/${categoryId}`);
      addToast('Category deleted successfully', 'success');
      setShowDeleteConfirm(null);
      onCategoryChange();
    } catch (error: any) {
      addToast(error.message || 'Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', color: DEFAULT_COLORS[0] });
    setEditingCategory(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Manage Categories
        </h3>
        <Button
          variant="primary"
          onClick={() => {
            setEditingCategory(null);
            setShowForm(!showForm);
          }}
        >
          {showForm && !editingCategory ? 'Cancel' : 'Add Category'}
        </Button>
      </div>

      {/* Category Form */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name
              </label>
              <input
                type="text"
                id="categoryName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                placeholder="Enter category name"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category Color
              </label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color 
                        ? 'border-gray-900 dark:border-white' 
                        : 'border-gray-300 dark:border-gray-600'
                    } hover:scale-110 transition-transform`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  title="Custom color"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={!formData.name.trim()}
              >
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Categories ({categories.length})
          </h4>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {categories.map((category) => (
              <div key={category.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                        {category.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Default
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.color}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(category)}
                    >
                      Edit
                    </Button>
                    {!category.isDefault && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(category.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-2">
                Delete Category
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this category? All expenses in this category will be moved to "Other".
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-4">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(showDeleteConfirm)}
                  isLoading={isDeleting}
                >
                  Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
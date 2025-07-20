import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import CategoryManager from './CategoryManager';
import { ToastProvider } from '../common/Toast';
import { Category } from 'shared';
import api from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Food',
    color: '#EF4444',
    isDefault: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Transportation',
    color: '#3B82F6',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Entertainment',
    color: '#8B5CF6',
    isDefault: false,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const renderWithToast = (component: React.ReactElement) => {
  return render(
    <ToastProvider>
      {component}
    </ToastProvider>
  );
};

describe('CategoryManager', () => {
  const mockOnCategoryChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnCategoryChange.mockClear();
  });

  it('renders categories list correctly', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    expect(screen.getByText('Categories (3)')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('Transportation')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument(); // Default badge for Food
  });

  it('shows empty state when no categories', () => {
    renderWithToast(
      <CategoryManager 
        categories={[]} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    expect(screen.getByText('Categories (0)')).toBeInTheDocument();
    expect(screen.getByText('No categories found.')).toBeInTheDocument();
  });

  it('opens and closes add category form', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Initially form should not be visible
    expect(screen.queryByText('Add New Category')).not.toBeInTheDocument();

    // Click Add Category button
    fireEvent.click(screen.getByText('Add Category'));
    expect(screen.getByText('Add New Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter category name')).toBeInTheDocument();

    // Click Cancel button (get the one inside the form)
    const cancelButtons = screen.getAllByText('Cancel');
    const formCancelButton = cancelButtons.find(btn => 
      btn.closest('form') // Button inside form
    );
    if (formCancelButton) {
      fireEvent.click(formCancelButton);
    }
    expect(screen.queryByText('Add New Category')).not.toBeInTheDocument();
  });

  it('creates a new category successfully', async () => {
    const mockApiResponse = {
      data: {
        id: '4',
        name: 'Shopping',
        color: '#10B981',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    };

    (api.post as any).mockResolvedValue(mockApiResponse);

    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Add Category'));

    // Fill form
    const nameInput = screen.getByPlaceholderText('Enter category name');
    fireEvent.change(nameInput, { target: { value: 'Shopping' } });

    // Select a color
    const colorButtons = screen.getAllByRole('button');
    const greenColorButton = colorButtons.find(btn => 
      btn.style.backgroundColor === 'rgb(16, 185, 129)' // #10B981
    );
    if (greenColorButton) {
      fireEvent.click(greenColorButton);
    }

    // Submit form
    fireEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/categories', {
        name: 'Shopping',
        color: '#10B981',
      });
      expect(mockOnCategoryChange).toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Add Category'));

    // Try to submit without name
    const submitButton = screen.getByText('Create Category');
    expect(submitButton).toBeDisabled(); // Should be disabled when name is empty

    // Add name
    const nameInput = screen.getByPlaceholderText('Enter category name');
    fireEvent.change(nameInput, { target: { value: 'Test Category' } });
    expect(submitButton).not.toBeDisabled();

    // Clear name with spaces
    fireEvent.change(nameInput, { target: { value: '   ' } });
    expect(submitButton).toBeDisabled();
  });

  it('opens edit form with existing category data', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Click edit button for Transportation category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[1]); // Transportation is second in list

    expect(screen.getByText('Edit Category')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Transportation')).toBeInTheDocument();
  });

  it('updates an existing category successfully', async () => {
    const mockApiResponse = {
      data: {
        id: '2',
        name: 'Public Transport',
        color: '#3B82F6',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    };

    (api.put as any).mockResolvedValue(mockApiResponse);

    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Click edit button for Transportation category
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[1]);

    // Update name
    const nameInput = screen.getByDisplayValue('Transportation');
    fireEvent.change(nameInput, { target: { value: 'Public Transport' } });

    // Submit form
    fireEvent.click(screen.getByText('Update Category'));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/categories/2', {
        name: 'Public Transport',
        color: '#3B82F6',
      });
      expect(mockOnCategoryChange).toHaveBeenCalled();
    });
  });

  it('shows delete confirmation modal', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Click delete button for Entertainment category (non-default)
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // Entertainment should have delete button

    expect(screen.getByText('Delete Category')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this category/)).toBeInTheDocument();
  });

  it('deletes a category successfully', async () => {
    (api.delete as any).mockResolvedValue({});

    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Click delete button for Transportation category (first non-default category)
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // Transportation is first delete button

    // Confirm deletion
    const confirmDeleteButton = screen.getAllByText('Delete').find(btn => 
      btn.closest('.fixed') // Button inside modal
    );
    if (confirmDeleteButton) {
      fireEvent.click(confirmDeleteButton);
    }

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/categories/2'); // Transportation ID
      expect(mockOnCategoryChange).toHaveBeenCalled();
    });
  });

  it('cancels delete operation', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Cancel deletion
    const cancelButtons = screen.getAllByText('Cancel');
    const modalCancelButton = cancelButtons.find(btn => 
      btn.closest('.fixed') // Button inside modal
    );
    if (modalCancelButton) {
      fireEvent.click(modalCancelButton);
    }

    expect(screen.queryByText('Delete Category')).not.toBeInTheDocument();
  });

  it('does not show delete button for default categories', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Food is a default category, should not have delete button
    expect(screen.getByText('Default')).toBeInTheDocument();
    
    // Count delete buttons - should be 2 (for Transportation and Entertainment)
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
    
    // Verify Food category doesn't have delete button by checking its container
    const foodText = screen.getByText('Food');
    const foodContainer = foodText.closest('.p-4');
    expect(foodContainer?.textContent).toContain('Default');
    expect(foodContainer?.textContent).not.toContain('Delete');
  });

  it('allows custom color selection', () => {
    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Add Category'));

    // Find and use custom color input
    const customColorInput = screen.getByTitle('Custom color');
    fireEvent.change(customColorInput, { target: { value: '#FF5733' } });

    // Browser normalizes hex colors to lowercase
    expect(customColorInput).toHaveValue('#ff5733');
  });

  it('handles API errors gracefully', async () => {
    const mockError = new Error('Network error');
    (api.post as any).mockRejectedValue(mockError);

    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Open form and fill it
    fireEvent.click(screen.getByText('Add Category'));
    const nameInput = screen.getByPlaceholderText('Enter category name');
    fireEvent.change(nameInput, { target: { value: 'Test Category' } });

    // Submit form
    fireEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      // Form should still be open after error
      expect(screen.getByText('Add New Category')).toBeInTheDocument();
    });
  });

  it('trims whitespace from category names', async () => {
    const mockApiResponse = {
      data: {
        id: '4',
        name: 'Test Category',
        color: '#EF4444',
        isDefault: false,
        createdAt: '2024-01-01T00:00:00Z',
      },
    };

    (api.post as any).mockResolvedValue(mockApiResponse);

    renderWithToast(
      <CategoryManager 
        categories={mockCategories} 
        onCategoryChange={mockOnCategoryChange} 
      />
    );

    // Open form
    fireEvent.click(screen.getByText('Add Category'));

    // Fill form with whitespace
    const nameInput = screen.getByPlaceholderText('Enter category name');
    fireEvent.change(nameInput, { target: { value: '  Test Category  ' } });

    // Submit form
    fireEvent.click(screen.getByText('Create Category'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/categories', {
        name: 'Test Category', // Should be trimmed
        color: '#EF4444',
      });
    });
  });
});
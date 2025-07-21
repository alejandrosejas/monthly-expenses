import { renderHook, act } from '@testing-library/react';
import { useDataSync } from './useDataSync';
import { useExpenseContext } from '../contexts/ExpenseContext';
import { useToast } from '../components/common/Toast';
import { vi } from 'vitest';

// Mock dependencies
vi.mock('../contexts/ExpenseContext');
vi.mock('../components/common/Toast');

const mockUseExpenseContext = useExpenseContext as any;
const mockUseToast = useToast as any;

const mockAddToast = vi.fn();
const mockExpenseContext = {
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateBudget: vi.fn(),
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useDataSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    mockUseToast.mockReturnValue({ addToast: mockAddToast });
    mockUseExpenseContext.mockReturnValue(mockExpenseContext as any);
    
    // Reset online status
    Object.defineProperty(navigator, 'onLine', { value: true });
    
    // Clear localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with online status', () => {
      const { result } = renderHook(() => useDataSync());

      expect(result.current.isOnline).toBe(true);
      expect(result.current.isSyncing).toBe(false);
      expect(result.current.pendingOperations).toEqual([]);
    });

    it('should load pending operations from localStorage', () => {
      const pendingOps = [
        {
          id: '1',
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(pendingOps));

      const { result } = renderHook(() => useDataSync());

      expect(result.current.pendingOperations).toEqual(pendingOps);
    });

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      const { result } = renderHook(() => useDataSync());

      expect(result.current.pendingOperations).toEqual([]);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expense-tracker-pending-operations');
    });
  });

  describe('online/offline handling', () => {
    it('should handle going offline', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });

      expect(result.current.isOnline).toBe(false);
      expect(mockAddToast).toHaveBeenCalledWith(
        'Working offline - changes will sync when connection is restored',
        'info'
      );
    });

    it('should handle coming back online', () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false });
      const { result } = renderHook(() => useDataSync());

      // Add pending operation
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      // Come back online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: true });
        window.dispatchEvent(new Event('online'));
      });

      expect(result.current.isOnline).toBe(true);
      expect(mockAddToast).toHaveBeenCalledWith('Connection restored', 'success');
    });

    it('should not show offline message when offline mode is disabled', () => {
      const { result } = renderHook(() => useDataSync({ enableOfflineMode: false }));

      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });

      expect(mockAddToast).toHaveBeenCalledWith('Connection lost', 'error');
    });
  });

  describe('pending operations', () => {
    it('should add pending operation', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      expect(result.current.pendingOperations).toHaveLength(1);
      expect(result.current.pendingOperations[0]).toMatchObject({
        type: 'create',
        resource: 'expense',
        data: { expense: { amount: 50 }, month: '2024-01' },
        retryCount: 0,
      });
    });

    it('should not add pending operation when offline mode is disabled', () => {
      const { result } = renderHook(() => useDataSync({ enableOfflineMode: false }));

      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      expect(result.current.pendingOperations).toHaveLength(0);
    });

    it('should save pending operations to localStorage', () => {
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'expense-tracker-pending-operations',
        expect.stringContaining('"type":"create"')
      );
    });

    it('should clear pending operations', () => {
      const { result } = renderHook(() => useDataSync());

      // Add operation first
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      // Clear operations
      act(() => {
        result.current.clearPendingOperations();
      });

      expect(result.current.pendingOperations).toHaveLength(0);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('expense-tracker-pending-operations');
      expect(mockAddToast).toHaveBeenCalledWith('Cleared all pending operations', 'info');
    });
  });

  describe('data synchronization', () => {
    it('should sync expense operations', async () => {
      mockExpenseContext.createExpense.mockResolvedValue({ id: '1' });
      mockExpenseContext.updateExpense.mockResolvedValue({ id: '1' });
      mockExpenseContext.deleteExpense.mockResolvedValue(true);

      const { result } = renderHook(() => useDataSync());

      // Add pending operations
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
        result.current.addPendingOperation({
          type: 'update',
          resource: 'expense',
          data: { expense: { amount: 60 }, month: '2024-01', expenseId: '1' },
        });
        result.current.addPendingOperation({
          type: 'delete',
          resource: 'expense',
          data: { month: '2024-01', expenseId: '1' },
        });
      });

      // Sync data
      await act(async () => {
        await result.current.syncData();
      });

      expect(mockExpenseContext.createExpense).toHaveBeenCalledWith('2024-01', { amount: 50 });
      expect(mockExpenseContext.updateExpense).toHaveBeenCalledWith('2024-01', '1', { amount: 60 });
      expect(mockExpenseContext.deleteExpense).toHaveBeenCalledWith('2024-01', '1');
      expect(result.current.pendingOperations).toHaveLength(0);
      expect(mockAddToast).toHaveBeenCalledWith('Synced 3 pending operations', 'success');
    });

    it('should sync category operations', async () => {
      mockExpenseContext.createCategory.mockResolvedValue({ id: '1' });
      mockExpenseContext.updateCategory.mockResolvedValue({ id: '1' });
      mockExpenseContext.deleteCategory.mockResolvedValue(true);

      const { result } = renderHook(() => useDataSync());

      // Add pending operations
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'category',
          data: { category: { name: 'Food' } },
        });
        result.current.addPendingOperation({
          type: 'update',
          resource: 'category',
          data: { category: { name: 'Updated Food' }, categoryId: '1' },
        });
        result.current.addPendingOperation({
          type: 'delete',
          resource: 'category',
          data: { categoryId: '1' },
        });
      });

      // Sync data
      await act(async () => {
        await result.current.syncData();
      });

      expect(mockExpenseContext.createCategory).toHaveBeenCalledWith({ name: 'Food' });
      expect(mockExpenseContext.updateCategory).toHaveBeenCalledWith('1', { name: 'Updated Food' });
      expect(mockExpenseContext.deleteCategory).toHaveBeenCalledWith('1');
    });

    it('should sync budget operations', async () => {
      mockExpenseContext.updateBudget.mockResolvedValue({ id: '1' });

      const { result } = renderHook(() => useDataSync());

      // Add pending operations
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'budget',
          data: { budget: { totalBudget: 1000 }, month: '2024-01' },
        });
        result.current.addPendingOperation({
          type: 'update',
          resource: 'budget',
          data: { budget: { totalBudget: 1200 }, month: '2024-01' },
        });
      });

      // Sync data
      await act(async () => {
        await result.current.syncData();
      });

      expect(mockExpenseContext.updateBudget).toHaveBeenCalledWith('2024-01', { totalBudget: 1000 });
      expect(mockExpenseContext.updateBudget).toHaveBeenCalledWith('2024-01', { totalBudget: 1200 });
    });

    it('should handle sync failures and retry', async () => {
      mockExpenseContext.createExpense.mockRejectedValueOnce(new Error('Network error'));
      mockExpenseContext.createExpense.mockResolvedValueOnce({ id: '1' });

      const { result } = renderHook(() => useDataSync({ retryDelay: 100 }));

      // Add pending operation
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      // First sync attempt (should fail)
      await act(async () => {
        await result.current.syncData();
      });

      expect(result.current.pendingOperations).toHaveLength(1);
      expect(result.current.pendingOperations[0].retryCount).toBe(1);

      // Wait for retry
      await act(async () => {
        vi.advanceTimersByTime(100);
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockExpenseContext.createExpense).toHaveBeenCalledTimes(2);
      expect(result.current.pendingOperations).toHaveLength(0);
    });

    it('should discard operations after max retries', async () => {
      mockExpenseContext.createExpense.mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() => useDataSync({ maxRetries: 2 }));

      // Add pending operation
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      // Sync multiple times to exceed max retries
      await act(async () => {
        await result.current.syncData(); // Retry count: 1
      });
      await act(async () => {
        await result.current.syncData(); // Retry count: 2
      });
      await act(async () => {
        await result.current.syncData(); // Should discard
      });

      expect(result.current.pendingOperations).toHaveLength(0);
      expect(mockAddToast).toHaveBeenCalledWith(
        'Failed to sync expense create after 2 attempts',
        'error'
      );
    });

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      const { result } = renderHook(() => useDataSync());

      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      await act(async () => {
        await result.current.syncData();
      });

      expect(mockExpenseContext.createExpense).not.toHaveBeenCalled();
      expect(result.current.pendingOperations).toHaveLength(1);
    });

    it('should not sync when offline mode is disabled', async () => {
      const { result } = renderHook(() => useDataSync({ enableOfflineMode: false }));

      await act(async () => {
        await result.current.syncData();
      });

      expect(mockExpenseContext.createExpense).not.toHaveBeenCalled();
    });
  });

  describe('periodic sync', () => {
    it('should set up periodic sync when interval is specified', () => {
      const { result } = renderHook(() => useDataSync({ syncInterval: 1000 }));

      // Add pending operation
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.isSyncing).toBe(true);
    });

    it('should not set up periodic sync when offline', () => {
      Object.defineProperty(navigator, 'onLine', { value: false });
      const { result } = renderHook(() => useDataSync({ syncInterval: 1000 }));

      // Add pending operation
      act(() => {
        result.current.addPendingOperation({
          type: 'create',
          resource: 'expense',
          data: { expense: { amount: 50 }, month: '2024-01' },
        });
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockExpenseContext.createExpense).not.toHaveBeenCalled();
    });
  });
});
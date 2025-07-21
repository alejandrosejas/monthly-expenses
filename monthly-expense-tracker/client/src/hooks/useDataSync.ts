import { useEffect, useCallback, useRef, useState } from 'react';
import { useExpenseContext } from '../contexts/ExpenseContext';
import { useToast } from '../components/common/Toast';

interface PendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resource: 'expense' | 'category' | 'budget';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface UseDataSyncOptions {
  enableOfflineMode?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  syncInterval?: number;
}

interface UseDataSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOperations: PendingOperation[];
  syncData: () => Promise<void>;
  clearPendingOperations: () => void;
  addPendingOperation: (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => void;
}

const STORAGE_KEY = 'expense-tracker-pending-operations';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const SYNC_INTERVAL = 30000; // 30 seconds

export const useDataSync = (options: UseDataSyncOptions = {}): UseDataSyncReturn => {
  const {
    enableOfflineMode = true,
    maxRetries = MAX_RETRIES,
    retryDelay = RETRY_DELAY,
    syncInterval = SYNC_INTERVAL,
  } = options;

  const { addToast } = useToast();
  const {
    createExpense,
    updateExpense,
    deleteExpense,
    createCategory,
    updateCategory,
    deleteCategory,
    updateBudget,
  } = useExpenseContext();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  
  const syncTimeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Load pending operations from localStorage on mount
  useEffect(() => {
    if (enableOfflineMode) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const operations = JSON.parse(stored);
          setPendingOperations(operations);
        } catch (error) {
          console.error('Failed to parse pending operations:', error);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
  }, [enableOfflineMode]);

  // Save pending operations to localStorage whenever they change
  useEffect(() => {
    if (enableOfflineMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingOperations));
    }
  }, [pendingOperations, enableOfflineMode]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addToast('Connection restored', 'success');
      
      // Sync pending operations when coming back online
      if (pendingOperations.length > 0) {
        syncData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (enableOfflineMode) {
        addToast('Working offline - changes will sync when connection is restored', 'info');
      } else {
        addToast('Connection lost', 'error');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineMode, pendingOperations.length, addToast]);

  // Set up periodic sync
  useEffect(() => {
    if (enableOfflineMode && isOnline && syncInterval > 0) {
      syncTimeoutRef.current = setInterval(() => {
        if (pendingOperations.length > 0) {
          syncData();
        }
      }, syncInterval);

      return () => {
        if (syncTimeoutRef.current) {
          clearInterval(syncTimeoutRef.current);
        }
      };
    }
  }, [enableOfflineMode, isOnline, syncInterval, pendingOperations.length]);

  // Add pending operation
  const addPendingOperation = useCallback((operation: Omit<PendingOperation, 'id' | 'timestamp' | 'retryCount'>) => {
    if (!enableOfflineMode) return;

    const pendingOp: PendingOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    setPendingOperations(prev => [...prev, pendingOp]);
  }, [enableOfflineMode]);

  // Execute a single pending operation
  const executePendingOperation = useCallback(async (operation: PendingOperation): Promise<boolean> => {
    try {
      switch (operation.resource) {
        case 'expense':
          switch (operation.type) {
            case 'create':
              await createExpense(operation.data.month, operation.data.expense);
              break;
            case 'update':
              await updateExpense(operation.data.month, operation.data.expenseId, operation.data.expense);
              break;
            case 'delete':
              await deleteExpense(operation.data.month, operation.data.expenseId);
              break;
          }
          break;

        case 'category':
          switch (operation.type) {
            case 'create':
              await createCategory(operation.data.category);
              break;
            case 'update':
              await updateCategory(operation.data.categoryId, operation.data.category);
              break;
            case 'delete':
              await deleteCategory(operation.data.categoryId);
              break;
          }
          break;

        case 'budget':
          switch (operation.type) {
            case 'create':
            case 'update':
              await updateBudget(operation.data.month, operation.data.budget);
              break;
          }
          break;

        default:
          throw new Error(`Unknown resource type: ${operation.resource}`);
      }

      return true;
    } catch (error) {
      console.error('Failed to execute pending operation:', error);
      return false;
    }
  }, [createExpense, updateExpense, deleteExpense, createCategory, updateCategory, deleteCategory, updateBudget]);

  // Sync all pending operations
  const syncData = useCallback(async (): Promise<void> => {
    if (!isOnline || !enableOfflineMode || pendingOperations.length === 0) {
      return;
    }

    setIsSyncing(true);

    const operationsToSync = [...pendingOperations];
    const failedOperations: PendingOperation[] = [];
    let successCount = 0;

    for (const operation of operationsToSync) {
      const success = await executePendingOperation(operation);
      
      if (success) {
        successCount++;
      } else {
        // Increment retry count and add back to failed operations if under max retries
        if (operation.retryCount < maxRetries) {
          failedOperations.push({
            ...operation,
            retryCount: operation.retryCount + 1,
          });
        } else {
          // Max retries reached, log error and discard operation
          console.error('Max retries reached for operation:', operation);
          addToast(`Failed to sync ${operation.resource} ${operation.type} after ${maxRetries} attempts`, 'error');
        }
      }
    }

    // Update pending operations with only the failed ones
    setPendingOperations(failedOperations);

    if (successCount > 0) {
      addToast(`Synced ${successCount} pending operation${successCount > 1 ? 's' : ''}`, 'success');
    }

    if (failedOperations.length > 0) {
      // Schedule retry for failed operations
      retryTimeoutRef.current = setTimeout(() => {
        syncData();
      }, retryDelay);
    }

    setIsSyncing(false);
  }, [
    isOnline,
    enableOfflineMode,
    pendingOperations,
    executePendingOperation,
    maxRetries,
    retryDelay,
    addToast,
  ]);

  // Clear all pending operations
  const clearPendingOperations = useCallback(() => {
    setPendingOperations([]);
    localStorage.removeItem(STORAGE_KEY);
    addToast('Cleared all pending operations', 'info');
  }, [addToast]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearInterval(syncTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingOperations,
    syncData,
    clearPendingOperations,
    addPendingOperation,
  };
};

export default useDataSync;
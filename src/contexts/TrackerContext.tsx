import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trackerAPI } from '@/services/api';

export interface TrackerState {
  stops: number;
  contacts: number;
  presentations: number;
  addressChecks: number;
  creditChecks: number;
  sales: number;
  products: number;
}

interface TrackerContextType {
  tracker: TrackerState;
  setTracker: (tracker: TrackerState) => void;
  increment: (field: keyof TrackerState) => void;
  decrement: (field: keyof TrackerState) => void;
  resetTracker: () => void;
  selectedStore: string;
  setSelectedStore: (storeId: string) => void;
  loadTodayData: (userId: string) => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const STORAGE_KEY = 'veridex_live_tracker';
const STORE_KEY = 'veridex_selected_store';

export function TrackerProvider({ children }: { children: ReactNode }) {
  // Load from localStorage on mount
  const [selectedStore, setSelectedStoreState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORE_KEY);
      return stored || "";
    } catch {
      return "";
    }
  });

  const [tracker, setTrackerState] = useState<TrackerState>(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = localStorage.getItem(`${STORAGE_KEY}_${today}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load tracker from localStorage:', error);
    }
    return {
      stops: 0,
      contacts: 0,
      presentations: 0,
      addressChecks: 0,
      creditChecks: 0,
      sales: 0,
      products: 0,
    };
  });

  // Custom setter that also saves to localStorage
  const setSelectedStore = (storeId: string) => {
    setSelectedStoreState(storeId);
    try {
      localStorage.setItem(STORE_KEY, storeId);
    } catch (error) {
      console.error('Failed to save store to localStorage:', error);
    }
  };

  const setTracker = (newTracker: TrackerState) => {
    setTrackerState(newTracker);
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`${STORAGE_KEY}_${today}`, JSON.stringify(newTracker));
    } catch (error) {
      console.error('Failed to save tracker to localStorage:', error);
    }
  };

  // Save to localStorage whenever tracker changes
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = `${STORAGE_KEY}_${today}`;
      const dataToSave = JSON.stringify(tracker);
      
      localStorage.setItem(storageKey, dataToSave);
      
      // Verify save was successful
      const savedData = localStorage.getItem(storageKey);
      if (savedData === dataToSave) {
        console.log('✅ Tracker saved to localStorage:', storageKey, tracker);
      } else {
        console.error('❌ localStorage save verification failed!');
        console.error('   Expected:', dataToSave);
        console.error('   Got:', savedData);
      }
    } catch (error) {
      console.error('❌ Failed to save tracker to localStorage:', error);
      // Show user-facing error if storage fails
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        alert('Storage quota exceeded! Please clear browser data or use a different browser.');
      }
    }
  }, [tracker]);

  const increment = (field: keyof TrackerState) => {
    setTracker({ ...tracker, [field]: tracker[field] + 1 });
  };

  const decrement = (field: keyof TrackerState) => {
    setTracker({ ...tracker, [field]: Math.max(0, tracker[field] - 1) });
  };

  const resetTracker = () => {
    const emptyTracker = {
      stops: 0,
      contacts: 0,
      presentations: 0,
      addressChecks: 0,
      creditChecks: 0,
      sales: 0,
      products: 0,
    };
    setTracker(emptyTracker);
  };

  const loadTodayData = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { progress } = await trackerAPI.getProgress(today);
      
      if (progress) {
        const loadedTracker = {
          contacts: progress.contacts || 0,
          stops: progress.stops || 0,
          presentations: progress.presentations || 0,
          addressChecks: progress.address_checks || 0,
          creditChecks: progress.credit_checks || 0,
          sales: progress.sales || 0,
          products: progress.products || 0,
        };
        setTracker(loadedTracker);
        
        // Also restore selected store if available
        if (progress.store_id) {
          setSelectedStore(progress.store_id);
        }
      }
    } catch (error) {
      console.error('Failed to load tracker progress:', error);
    }
  };

  // Clean up old localStorage entries (keep only last 7 days)
  useEffect(() => {
    try {
      const today = new Date();
      for (let i = 8; i < 30; i++) {
        const oldDate = new Date(today);
        oldDate.setDate(oldDate.getDate() - i);
        const dateKey = oldDate.toISOString().split('T')[0];
        localStorage.removeItem(`${STORAGE_KEY}_${dateKey}`);
      }
    } catch (error) {
      console.error('Failed to clean up old tracker data:', error);
    }
  }, []);

  return (
    <TrackerContext.Provider
      value={{
        tracker,
        setTracker,
        increment,
        decrement,
        resetTracker,
        selectedStore,
        setSelectedStore,
        loadTodayData,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker() {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within TrackerProvider');
  }
  return context;
}
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { entriesAPI } from '@/services/api';

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
      localStorage.setItem(`${STORAGE_KEY}_${today}`, JSON.stringify(tracker));
    } catch (error) {
      console.error('Failed to save tracker to localStorage:', error);
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
    if (!selectedStore) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { entries } = await entriesAPI.getUserEntries(userId, {
        startDate: today,
        endDate: today,
      });
      
      // Find entry for selected store today
      const todayEntry = entries?.find((e: any) => 
        e.store_id === selectedStore && e.entry_date === today
      );
      
      if (todayEntry) {
        const loadedTracker = {
          stops: todayEntry.stops || 0,
          contacts: todayEntry.contacts || 0,
          presentations: todayEntry.presentations || 0,
          addressChecks: todayEntry.address_checks || 0,
          creditChecks: todayEntry.credit_checks || 0,
          sales: todayEntry.sales || 0,
          products: todayEntry.applications || 0, // Map from applications to products
        };
        setTracker(loadedTracker);
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
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
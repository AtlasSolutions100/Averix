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

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [selectedStore, setSelectedStore] = useState("");
  const [tracker, setTracker] = useState<TrackerState>({
    stops: 0,
    contacts: 0,
    presentations: 0,
    addressChecks: 0,
    creditChecks: 0,
    sales: 0,
    products: 0,
  });

  const increment = (field: keyof TrackerState) => {
    setTracker(prev => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const decrement = (field: keyof TrackerState) => {
    setTracker(prev => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }));
  };

  const resetTracker = () => {
    setTracker({
      stops: 0,
      contacts: 0,
      presentations: 0,
      addressChecks: 0,
      creditChecks: 0,
      sales: 0,
      products: 0,
    });
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
        setTracker({
          stops: todayEntry.stops || 0,
          contacts: todayEntry.contacts || 0,
          presentations: todayEntry.presentations || 0,
          addressChecks: todayEntry.address_checks || 0,
          creditChecks: todayEntry.credit_checks || 0,
          sales: todayEntry.sales || 0,
          products: todayEntry.applications || 0, // Map from applications to products
        });
      }
    } catch (error) {
      console.error('Failed to load today data:', error);
    }
  };

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
import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Plus, Minus, Save, RotateCcw, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trackerAPI, storesAPI } from "@/services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useTracker, type TrackerState } from "@/contexts/TrackerContext";
import type { User } from "@/app/App";

interface LiveTrackerViewProps {
  user: User;
}

export function LiveTrackerView({ user }: LiveTrackerViewProps) {
  const [stores, setStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasShownRestoreMessage, setHasShownRestoreMessage] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  const { 
    tracker, 
    increment, 
    decrement, 
    resetTracker, 
    selectedStore, 
    setSelectedStore,
    loadTodayData 
  } = useTracker();

  // Warn before closing/leaving page if there's unsaved data
  useEffect(() => {
    const hasData = Object.values(tracker).some(val => val > 0);
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasData) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        return ''; // Some browsers require a return value
      }
    };

    if (hasData) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tracker]);

  // Auto-save to database every 5 minutes if there's data (DRAFT - NOT OFFICIAL SUBMISSION)
  useEffect(() => {
    const hasData = Object.values(tracker).some(val => val > 0);
    if (!hasData || !selectedStore) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        await trackerAPI.saveProgress({
          date: today,
          storeId: selectedStore,
          contacts: tracker.contacts,
          stops: tracker.stops,
          presentations: tracker.presentations,
          addressChecks: tracker.addressChecks,
          creditChecks: tracker.creditChecks,
          sales: tracker.sales,
          products: tracker.products,
        });
        
        setLastAutoSave(new Date());
        console.log('✅ Auto-saved tracker progress (draft)');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoSaveInterval);
  }, [tracker, selectedStore]);

  // Show restore message if data was loaded from localStorage
  useEffect(() => {
    if (!hasShownRestoreMessage && !loadingStores) {
      const hasData = Object.values(tracker).some(val => val > 0);
      if (hasData) {
        toast.info("Progress restored", {
          description: "Your previous session was recovered",
        });
      } else {
        // Test localStorage on first load
        try {
          const testKey = 'veridex_storage_test';
          localStorage.setItem(testKey, 'test');
          const testValue = localStorage.getItem(testKey);
          localStorage.removeItem(testKey);
          
          if (testValue !== 'test') {
            toast.error("Storage Warning", {
              description: "Browser storage may not be working properly. Your progress might not save!",
              duration: 10000,
            });
          }
        } catch (error) {
          toast.error("Storage Disabled", {
            description: "Please enable browser storage or disable private browsing mode to save progress.",
            duration: 15000,
          });
        }
      }
      setHasShownRestoreMessage(true);
    }
  }, [loadingStores, hasShownRestoreMessage, tracker]);

  // Load stores
  useEffect(() => {
    const loadStores = async () => {
      try {
        const { stores: storesList } = await storesAPI.getStores();
        setStores(storesList || []);
        
        // If there's a selected store from localStorage, validate it exists
        if (selectedStore && storesList) {
          const storeExists = storesList.some((s: any) => s.id === selectedStore);
          if (!storeExists && storesList.length > 0) {
            // If saved store doesn't exist, select the first one
            setSelectedStore(storesList[0].id);
          }
        } else if (storesList && storesList.length > 0 && !selectedStore) {
          // If no store selected yet, select the first one
          setSelectedStore(storesList[0].id);
        }
      } catch (error: any) {
        console.error('Failed to load stores:', error);
        toast.error("Failed to load stores");
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  // Load today's data if it exists
  useEffect(() => {
    if (!selectedStore) return;
    loadTodayData(user.id);
  }, [selectedStore, user.id]);

  const handleSave = async () => {
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    setSaving(true);
    try {
      // Manual save to tracker progress (draft)
      const today = new Date().toISOString().split('T')[0];
      await trackerAPI.saveProgress({
        date: today,
        storeId: selectedStore,
        contacts: tracker.contacts,
        stops: tracker.stops,
        presentations: tracker.presentations,
        addressChecks: tracker.addressChecks,
        creditChecks: tracker.creditChecks,
        sales: tracker.sales,
        products: tracker.products,
      });

      setLastAutoSave(new Date());
      toast.success("Progress saved (draft)!", {
        description: `${tracker.sales} sales tracked. Submit via Daily Entry to make it official.`,
        icon: <CheckCircle2 className="size-4" />,
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error("Failed to save", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Reset today's counters? This won't delete saved data.")) {
      resetTracker();
      toast.info("Counters reset");
    }
  };

  // Calculate rates
  const stopRate = tracker.contacts > 0 ? ((tracker.stops / tracker.contacts) * 100).toFixed(1) : "0.0";
  const presentationRate = tracker.stops > 0 ? ((tracker.presentations / tracker.stops) * 100).toFixed(1) : "0.0";
  const closeRate = tracker.contacts > 0 ? ((tracker.sales / tracker.contacts) * 100).toFixed(1) : "0.0";

  const CounterButton = ({ 
    label, 
    value, 
    field, 
    color = "blue" 
  }: { 
    label: string; 
    value: number; 
    field: keyof TrackerState; 
    color?: string;
  }) => {
    const colorClasses = {
      blue: "bg-blue-500/10 border-blue-500/20 text-foreground",
      green: "bg-green-500/10 border-green-500/20 text-foreground",
      purple: "bg-purple-500/10 border-purple-500/20 text-foreground",
      orange: "bg-orange-500/10 border-orange-500/20 text-foreground",
    }[color] || "bg-blue-500/10 border-blue-500/20 text-foreground";

    return (
      <Card className={`p-4 ${colorClasses} border-2`}>
        <p className="text-sm font-medium mb-3">{label}</p>
        <div className="flex items-center justify-between gap-3 mb-3">
          <Button
            size="icon"
            variant="outline"
            onClick={() => decrement(field)}
            className="h-10 w-10 rounded-full"
          >
            <Minus className="size-4" />
          </Button>
          
          <div className="text-4xl font-bold tabular-nums min-w-[60px] text-center">
            {value}
          </div>
          
          <Button
            size="icon"
            onClick={() => increment(field)}
            className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </Card>
    );
  };

  if (loadingStores) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Live Tracker</h2>
          <p className="text-sm text-muted-foreground">Track your LOA metrics in real-time</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Today</p>
          <p className="text-sm font-medium text-foreground">{new Date().toLocaleDateString()}</p>
          <p className="text-xs text-green-500 mt-1">✓ Auto-saving</p>
        </div>
      </div>

      {/* Store Selection */}
      <Card className="p-4 bg-card border-border">
        <label className="text-sm font-medium mb-2 block text-foreground">Current Store</label>
        <Select value={selectedStore} onValueChange={setSelectedStore}>
          <SelectTrigger>
            <SelectValue placeholder="Select store" />
          </SelectTrigger>
          <SelectContent>
            {stores.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} - {s.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div>
          <p className="text-xs text-blue-400">Stop Rate</p>
          <p className="text-2xl font-bold text-foreground">{stopRate}%</p>
        </div>
        <div>
          <p className="text-xs text-blue-400">Presentation Rate</p>
          <p className="text-2xl font-bold text-foreground">{presentationRate}%</p>
        </div>
        <div>
          <p className="text-xs text-blue-400">Close Rate</p>
          <p className="text-2xl font-bold text-foreground">{closeRate}%</p>
        </div>
      </div>

      {/* Counters */}
      <div className="space-y-3">
        <CounterButton label="1. Contacts" value={tracker.contacts} field="contacts" color="blue" />
        <CounterButton label="2. Stops" value={tracker.stops} field="stops" color="blue" />
        <CounterButton label="3. Presentations" value={tracker.presentations} field="presentations" color="green" />
        <CounterButton label="4. Address Checks" value={tracker.addressChecks} field="addressChecks" color="purple" />
        <CounterButton label="5. Credit Checks" value={tracker.creditChecks} field="creditChecks" color="purple" />
        <CounterButton label="6. Sales" value={tracker.sales} field="sales" color="orange" />
        <CounterButton label="7. Products" value={tracker.products} field="products" color="orange" />
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-card border-t border-border shadow-lg lg:relative lg:shadow-none lg:border-0">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            onClick={handleSave}
            className="flex-1 bg-primary hover:bg-primary/90 h-12 shadow-lg shadow-primary/20"
            disabled={saving}
          >
            <Save className="size-4 mr-2" />
            {saving ? "Saving..." : "Save Progress"}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 bg-secondary/50 hover:bg-secondary border-border"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
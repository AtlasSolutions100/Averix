import { useState, useEffect } from "react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { entriesAPI, storesAPI } from "@/services/api";
import { useTracker } from "@/contexts/TrackerContext";
import type { User } from "@/app/App";

interface DailyEntryViewProps {
  user: User;
}

export function DailyEntryView({ user }: DailyEntryViewProps) {
  const [stores, setStores] = useState<any[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { tracker, selectedStore, setSelectedStore } = useTracker();
  
  // LOA Metrics - auto-populated from tracker
  const [contacts, setContacts] = useState("");
  const [stops, setStops] = useState("");
  const [presentations, setPresentations] = useState("");
  const [addressChecks, setAddressChecks] = useState("");
  const [creditChecks, setCreditChecks] = useState("");
  const [sales, setSales] = useState("");
  const [products, setProducts] = useState("");
  
  // Additional metrics
  const [hoursWorked, setHoursWorked] = useState("");
  const [revenue, setRevenue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Auto-populate from tracker whenever tracker changes
  useEffect(() => {
    // Always populate with tracker values, including 0
    setContacts(tracker.contacts.toString());
    setStops(tracker.stops.toString());
    setPresentations(tracker.presentations.toString());
    setAddressChecks(tracker.addressChecks.toString());
    setCreditChecks(tracker.creditChecks.toString());
    setSales(tracker.sales.toString());
    setProducts(tracker.products.toString());
  }, [tracker]);

  // Load stores on mount
  useEffect(() => {
    const loadStores = async () => {
      try {
        const { stores: storesList } = await storesAPI.getStores();
        setStores(storesList || []);
      } catch (error: any) {
        console.error('Failed to load stores:', error);
        toast.error("Failed to load stores", {
          description: error.message
        });
      } finally {
        setLoadingStores(false);
      }
    };
    loadStores();
  }, []);

  // Calculate conversion rates
  const stopRate = contacts && stops ? ((parseInt(stops) / parseInt(contacts)) * 100).toFixed(1) : "0.0";
  const presentationRate = stops && presentations ? ((parseInt(presentations) / parseInt(stops)) * 100).toFixed(1) : "0.0";
  const addressCheckRate = presentations && addressChecks ? ((parseInt(addressChecks) / parseInt(presentations)) * 100).toFixed(1) : "0.0";
  const creditCheckRate = addressChecks && creditChecks ? ((parseInt(creditChecks) / parseInt(addressChecks)) * 100).toFixed(1) : "0.0";
  const closeRate = creditChecks && sales ? ((parseInt(sales) / parseInt(creditChecks)) * 100).toFixed(1) : "0.0";
  const overallCloseRate = contacts && sales ? ((parseInt(sales) / parseInt(contacts)) * 100).toFixed(1) : "0.0";
  const revenuePerContact = contacts && revenue ? (parseFloat(revenue) / parseInt(contacts)).toFixed(2) : "0.00";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedStore) {
      toast.error("Please select a store");
      return;
    }

    if (!hoursWorked || parseFloat(hoursWorked) <= 0) {
      toast.error("Please enter hours worked", {
        description: "This field is required"
      });
      return;
    }

    if (!revenue || parseFloat(revenue) < 0) {
      toast.error("Please enter total revenue", {
        description: "Revenue is required (enter 0 if no revenue)"
      });
      return;
    }

    // Validate all LOA fields are filled
    if (contacts === "" || stops === "" || presentations === "" || 
        addressChecks === "" || creditChecks === "" || sales === "" || products === "") {
      toast.error("Please fill in all LOA fields", {
        description: "All fields are required (enter 0 if none)"
      });
      return;
    }

    setSubmitting(true);

    try {
      await entriesAPI.submit({
        storeId: selectedStore,
        date,
        stops: parseInt(stops) || 0,
        contacts: parseInt(contacts) || 0,
        presentations: parseInt(presentations) || 0,
        addressChecks: parseInt(addressChecks) || 0,
        creditChecks: parseInt(creditChecks) || 0,
        sales: parseInt(sales) || 0,
        applications: parseInt(products) || 0, // Map products to applications in database
        hoursWorked: parseFloat(hoursWorked),
        revenue: parseFloat(revenue),
      });

      toast.success("Daily entry saved successfully!", {
        description: `${sales} sales recorded for ${stores.find(s => s.id === selectedStore)?.name}`
      });

      // Reset form
      setStops("");
      setContacts("");
      setPresentations("");
      setAddressChecks("");
      setCreditChecks("");
      setSales("");
      setProducts("");
      setHoursWorked("");
      setRevenue("");
    } catch (error: any) {
      console.error('Failed to submit entry:', error);
      toast.error("Failed to save entry", {
        description: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 lg:pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Daily Entry</h2>
        <p className="text-sm text-muted-foreground">Log your daily performance metrics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store and Date */}
        <Card className="p-6 bg-card border-border">
          <div className="space-y-4">
            <div>
              <Label htmlFor="store" className="text-foreground">Store Location *</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {loadingStores ? (
                    <SelectItem value="loading" disabled>Loading stores...</SelectItem>
                  ) : (
                    stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {s.location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date" className="text-foreground">Date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10 bg-input-background border-border text-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hours" className="text-foreground">Hours Worked *</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="8"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="mt-1 bg-input-background border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>
        </Card>

        {/* Law of Averages Funnel */}
        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold text-lg mb-4 text-foreground">Law of Averages</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="contacts" className="text-foreground">1. Contacts</Label>
              <Input
                id="contacts"
                type="number"
                placeholder="0"
                value={contacts}
                onChange={(e) => setContacts(e.target.value)}
                className="mt-1 text-lg bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">How many people did you engage with?</p>
            </div>

            <div>
              <Label htmlFor="stops" className="text-foreground">2. Stops (Stopped to Talk)</Label>
              <Input
                id="stops"
                type="number"
                placeholder="0"
                value={stops}
                onChange={(e) => setStops(e.target.value)}
                className="mt-1 text-lg bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">How many stopped and listened?</p>
            </div>

            <div>
              <Label htmlFor="presentations" className="text-foreground">3. Presentations</Label>
              <Input
                id="presentations"
                type="number"
                placeholder="0"
                value={presentations}
                onChange={(e) => setPresentations(e.target.value)}
                className="mt-1 text-lg bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">How many received your full pitch?</p>
            </div>

            <div>
              <Label htmlFor="addressChecks" className="text-foreground">4. Address Checks</Label>
              <Input
                id="addressChecks"
                type="number"
                placeholder="0"
                value={addressChecks}
                onChange={(e) => setAddressChecks(e.target.value)}
                className="mt-1 text-lg bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">How many provided address verification?</p>
            </div>

            <div>
              <Label htmlFor="creditChecks" className="text-foreground">5. Credit Checks</Label>
              <Input
                id="creditChecks"
                type="number"
                placeholder="0"
                value={creditChecks}
                onChange={(e) => setCreditChecks(e.target.value)}
                className="mt-1 text-lg bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">How many ran credit?</p>
            </div>

            <div>
              <Label htmlFor="sales" className="text-foreground">6. Sales Closed</Label>
              <Input
                id="sales"
                type="number"
                placeholder="0"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
                className="mt-1 text-lg font-semibold bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">How many completed sales?</p>
            </div>

            <div>
              <Label htmlFor="products" className="text-foreground">7. Products</Label>
              <Input
                id="products"
                type="number"
                placeholder="0"
                value={products}
                onChange={(e) => setProducts(e.target.value)}
                className="mt-1 text-lg bg-input-background border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Total products sold</p>
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card className="p-6 bg-card border-border">
          <div>
            <Label htmlFor="revenue" className="text-foreground">Total Revenue *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="pl-7 text-lg font-semibold bg-input-background border-border text-foreground"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Enter 0 if no revenue generated</p>
          </div>
        </Card>

        {/* Auto-Calculated Metrics */}
        {contacts && sales && (
          <Card className="p-6 bg-blue-500/10 border-blue-500/20">
            <h4 className="font-semibold text-sm text-blue-400 mb-3">Auto-Calculated Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-400">Stop Rate</p>
                <p className="text-lg font-semibold text-foreground">{stopRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-400">Presentation Rate</p>
                <p className="text-lg font-semibold text-foreground">{presentationRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-400">Address Check Rate</p>
                <p className="text-lg font-semibold text-foreground">{addressCheckRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-400">Credit Check Rate</p>
                <p className="text-lg font-semibold text-foreground">{creditCheckRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-400">Close Rate</p>
                <p className="text-lg font-semibold text-foreground">{closeRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-400">Overall Close</p>
                <p className="text-lg font-semibold text-foreground">{overallCloseRate}%</p>
              </div>
              {revenue && (
                <div className="col-span-2">
                  <p className="text-xs text-blue-400">Revenue per Contact</p>
                  <p className="text-lg font-semibold text-foreground">${revenuePerContact}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-lg py-6 sticky bottom-4 lg:relative shadow-lg shadow-primary/20"
          disabled={submitting}
        >
          <CheckCircle2 className="size-5 mr-2" />
          {submitting ? "Submitting..." : "Submit Day"}
        </Button>
      </form>
    </div>
  );
}
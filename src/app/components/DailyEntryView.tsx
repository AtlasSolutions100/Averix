import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/app/App";

interface DailyEntryViewProps {
  user: User;
}

const STORES = [
  { id: "1", name: "Best Buy NFW", location: "North Fort Worth" },
  { id: "2", name: "Best Buy SFW", location: "South Fort Worth" },
  { id: "3", name: "Target Terhama", location: "Terhama" },
  { id: "4", name: "Target Arlington", location: "Arlington" },
];

export function DailyEntryView({ user }: DailyEntryViewProps) {
  const [store, setStore] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // LOA Metrics
  const [stops, setStops] = useState("");
  const [contacts, setContacts] = useState("");
  const [presentations, setPresentations] = useState("");
  const [addressChecks, setAddressChecks] = useState("");
  const [creditChecks, setCreditChecks] = useState("");
  const [sales, setSales] = useState("");
  const [applications, setApplications] = useState("");
  
  // Additional metrics
  const [hoursWorked, setHoursWorked] = useState("");
  const [revenue, setRevenue] = useState("");

  // Calculate conversion rates
  const contactRate = stops && contacts ? ((parseInt(contacts) / parseInt(stops)) * 100).toFixed(1) : "0.0";
  const presentationRate = contacts && presentations ? ((parseInt(presentations) / parseInt(contacts)) * 100).toFixed(1) : "0.0";
  const addressCheckRate = presentations && addressChecks ? ((parseInt(addressChecks) / parseInt(presentations)) * 100).toFixed(1) : "0.0";
  const creditCheckRate = addressChecks && creditChecks ? ((parseInt(creditChecks) / parseInt(addressChecks)) * 100).toFixed(1) : "0.0";
  const closeRate = creditChecks && sales ? ((parseInt(sales) / parseInt(creditChecks)) * 100).toFixed(1) : "0.0";
  const overallCloseRate = contacts && sales ? ((parseInt(sales) / parseInt(contacts)) * 100).toFixed(1) : "0.0";
  const revenuePerContact = contacts && revenue ? (parseFloat(revenue) / parseInt(contacts)).toFixed(2) : "0.00";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!store) {
      toast.error("Please select a store");
      return;
    }

    const entry = {
      userId: user.id,
      userName: user.name,
      store,
      date,
      stops: parseInt(stops) || 0,
      contacts: parseInt(contacts) || 0,
      presentations: parseInt(presentations) || 0,
      addressChecks: parseInt(addressChecks) || 0,
      creditChecks: parseInt(creditChecks) || 0,
      sales: parseInt(sales) || 0,
      applications: parseInt(applications) || 0,
      hoursWorked: parseFloat(hoursWorked) || 0,
      revenue: parseFloat(revenue) || 0,
      metrics: {
        contactRate,
        presentationRate,
        closeRate,
        overallCloseRate,
        revenuePerContact
      }
    };

    console.log("Daily entry:", entry);
    
    // TODO: Save to backend
    toast.success("Daily entry saved successfully!", {
      description: `${sales} sales recorded for ${STORES.find(s => s.id === store)?.name}`
    });

    // Reset form
    setStops("");
    setContacts("");
    setPresentations("");
    setAddressChecks("");
    setCreditChecks("");
    setSales("");
    setApplications("");
    setHoursWorked("");
    setRevenue("");
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24 lg:pb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Daily Entry</h2>
        <p className="text-sm text-gray-600">Log your daily performance metrics</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store and Date */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="store">Store Location *</Label>
              <Select value={store} onValueChange={setStore}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a store" />
                </SelectTrigger>
                <SelectContent>
                  {STORES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} - {s.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hours">Hours Worked</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                placeholder="8"
                value={hoursWorked}
                onChange={(e) => setHoursWorked(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Law of Averages Funnel */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4">Law of Averages</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="stops">1. Total Stops</Label>
              <Input
                id="stops"
                type="number"
                placeholder="0"
                value={stops}
                onChange={(e) => setStops(e.target.value)}
                className="mt-1 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">How many people did you approach?</p>
            </div>

            <div>
              <Label htmlFor="contacts">2. Contacts (Stopped to Talk)</Label>
              <Input
                id="contacts"
                type="number"
                placeholder="0"
                value={contacts}
                onChange={(e) => setContacts(e.target.value)}
                className="mt-1 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">How many stopped and engaged?</p>
            </div>

            <div>
              <Label htmlFor="presentations">3. Presentations</Label>
              <Input
                id="presentations"
                type="number"
                placeholder="0"
                value={presentations}
                onChange={(e) => setPresentations(e.target.value)}
                className="mt-1 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">How many received your full pitch?</p>
            </div>

            <div>
              <Label htmlFor="addressChecks">4. Address Checks</Label>
              <Input
                id="addressChecks"
                type="number"
                placeholder="0"
                value={addressChecks}
                onChange={(e) => setAddressChecks(e.target.value)}
                className="mt-1 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">How many provided address verification?</p>
            </div>

            <div>
              <Label htmlFor="creditChecks">5. Credit Checks</Label>
              <Input
                id="creditChecks"
                type="number"
                placeholder="0"
                value={creditChecks}
                onChange={(e) => setCreditChecks(e.target.value)}
                className="mt-1 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">How many ran credit?</p>
            </div>

            <div>
              <Label htmlFor="sales">6. Sales Closed</Label>
              <Input
                id="sales"
                type="number"
                placeholder="0"
                value={sales}
                onChange={(e) => setSales(e.target.value)}
                className="mt-1 text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">How many completed sales?</p>
            </div>

            <div>
              <Label htmlFor="applications">7. Applications</Label>
              <Input
                id="applications"
                type="number"
                placeholder="0"
                value={applications}
                onChange={(e) => setApplications(e.target.value)}
                className="mt-1 text-lg"
              />
              <p className="text-xs text-gray-500 mt-1">Total applications submitted</p>
            </div>
          </div>
        </Card>

        {/* Revenue */}
        <Card className="p-6">
          <div>
            <Label htmlFor="revenue">Total Revenue</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="revenue"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                className="pl-7 text-lg font-semibold"
              />
            </div>
          </div>
        </Card>

        {/* Auto-Calculated Metrics */}
        {contacts && sales && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-3">Auto-Calculated Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-blue-700">Contact Rate</p>
                <p className="text-lg font-semibold text-blue-900">{contactRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Presentation Rate</p>
                <p className="text-lg font-semibold text-blue-900">{presentationRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Address Check Rate</p>
                <p className="text-lg font-semibold text-blue-900">{addressCheckRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Credit Check Rate</p>
                <p className="text-lg font-semibold text-blue-900">{creditCheckRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Close Rate</p>
                <p className="text-lg font-semibold text-blue-900">{closeRate}%</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Overall Close</p>
                <p className="text-lg font-semibold text-blue-900">{overallCloseRate}%</p>
              </div>
              {revenue && (
                <div className="col-span-2">
                  <p className="text-xs text-blue-700">Revenue per Contact</p>
                  <p className="text-lg font-semibold text-blue-900">${revenuePerContact}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 sticky bottom-4 lg:relative shadow-lg"
        >
          <CheckCircle2 className="size-5 mr-2" />
          Submit Day
        </Button>
      </form>
    </div>
  );
}

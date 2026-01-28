import { useState, useEffect } from "react";
import { Calendar, TrendingUp, User as UserIcon, Store, Search, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { User } from "@/app/App";
import { entriesAPI, usersAPI } from "@/services/api";

interface EntriesViewProps {
  user: User;
}

interface Entry {
  id: string;
  user_id: string;
  store_id: string;
  date: string;
  stops: number;
  contacts: number;
  presentations: number;
  address_checks: number;
  credit_checks: number;
  sales: number;
  applications: number;
  hours_worked: number;
  revenue: number;
  created_at: string;
  // Joined data
  user_name?: string;
  store_name?: string;
}

export function EntriesView({ user }: EntriesViewProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("week");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [dateFilter]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on filter
      const endDate = new Date().toISOString().split('T')[0];
      let startDate = endDate;
      
      if (dateFilter === "today") {
        startDate = endDate;
      } else if (dateFilter === "week") {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        startDate = date.toISOString().split('T')[0];
      } else if (dateFilter === "month") {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        startDate = date.toISOString().split('T')[0];
      }
      
      const options = dateFilter === "all" ? undefined : { startDate, endDate };
      const data = await entriesAPI.getEntries(user.officeId, options);
      
      // Get user names for display
      const usersData = await usersAPI.getUsers();
      const usersMap = new Map(usersData.map((u: any) => [u.id, u.name]));
      
      // Enrich entries with user names
      const enrichedEntries = data.map((entry: Entry) => ({
        ...entry,
        user_name: usersMap.get(entry.user_id) || 'Unknown',
      }));
      
      setEntries(enrichedEntries);
    } catch (error: any) {
      console.error("Failed to load entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.store_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.date.includes(searchQuery)
  );

  const calculateMetrics = (entry: Entry) => {
    const contactRate = entry.stops > 0 ? ((entry.contacts / entry.stops) * 100).toFixed(1) : "0.0";
    const closeRate = entry.contacts > 0 ? ((entry.sales / entry.contacts) * 100).toFixed(1) : "0.0";
    const revenuePerHour = entry.hours_worked > 0 ? (entry.revenue / entry.hours_worked).toFixed(2) : "0.00";
    const revenuePerSale = entry.sales > 0 ? (entry.revenue / entry.sales).toFixed(2) : "0.00";
    
    return { contactRate, closeRate, revenuePerHour, revenuePerSale };
  };

  const totalStats = filteredEntries.reduce(
    (acc, entry) => ({
      sales: acc.sales + entry.sales,
      revenue: acc.revenue + entry.revenue,
      contacts: acc.contacts + entry.contacts,
      hours: acc.hours + entry.hours_worked,
    }),
    { sales: 0, revenue: 0, contacts: 0, hours: 0 }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Daily Entries</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View all team daily performance submissions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by rep, store, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {["all", "today", "week", "month"].map((filter) => (
            <Button
              key={filter}
              variant={dateFilter === filter ? "default" : "outline"}
              size="sm"
              onClick={() => setDateFilter(filter as any)}
              className="capitalize"
            >
              {filter === "all" ? "All Time" : filter}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="size-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Sales</p>
              <p className="text-2xl font-semibold">{totalStats.sales}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <UserIcon className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Contacts</p>
              <p className="text-2xl font-semibold">{totalStats.contacts}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary">$</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-semibold">${totalStats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <Calendar className="size-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-semibold">{totalStats.hours.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Calendar className="size-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No entries found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Try adjusting your search" : "No daily entries for this period"}
            </p>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const metrics = calculateMetrics(entry);
            const isExpanded = expandedEntry === entry.id;
            
            return (
              <div key={entry.id} className="bg-card border border-border rounded-lg overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                        <UserIcon className="size-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{entry.user_name}</h3>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1 text-sm">
                            <TrendingUp className="size-4 text-green-500" />
                            <span className="font-semibold text-foreground">{entry.sales} sales</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <UserIcon className="size-4" />
                            <span>{entry.contacts} contacts</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${entry.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground">Close Rate</p>
                        <p className="text-lg font-semibold text-primary">{metrics.closeRate}%</p>
                      </div>
                      
                      {isExpanded ? (
                        <ChevronUp className="size-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-border p-4 bg-secondary/20">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Contact Rate</p>
                        <p className="text-lg font-semibold text-foreground">{metrics.contactRate}%</p>
                        <p className="text-xs text-muted-foreground">{entry.contacts} / {entry.stops}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Presentations</p>
                        <p className="text-lg font-semibold text-foreground">{entry.presentations}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Address Checks</p>
                        <p className="text-lg font-semibold text-foreground">{entry.address_checks}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Credit Checks</p>
                        <p className="text-lg font-semibold text-foreground">{entry.credit_checks}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Revenue/Hour</p>
                        <p className="text-lg font-semibold text-foreground">${metrics.revenuePerHour}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Revenue/Sale</p>
                        <p className="text-lg font-semibold text-foreground">${metrics.revenuePerSale}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Hours Worked</p>
                        <p className="text-lg font-semibold text-foreground">{entry.hours_worked.toFixed(1)}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Products</p>
                        <p className="text-lg font-semibold text-foreground">{entry.applications}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

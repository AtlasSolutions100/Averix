import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";

const storeHistory = [
  { 
    id: 1, 
    name: "Costco - North Side", 
    location: "Austin, TX", 
    dateRange: "Dec 20 - Jan 5",
    daysWorked: 12,
    totalLOAs: 18,
    totalProduction: 8640,
    avgPerDay: 720,
    status: "completed"
  },
  { 
    id: 2, 
    name: "Sam's Club - East End", 
    location: "Austin, TX", 
    dateRange: "Dec 1 - Dec 18",
    daysWorked: 14,
    totalLOAs: 21,
    totalProduction: 9870,
    avgPerDay: 705,
    status: "completed"
  },
  { 
    id: 3, 
    name: "Target - Westgate", 
    location: "Austin, TX", 
    dateRange: "Nov 10 - Nov 28",
    daysWorked: 15,
    totalLOAs: 24,
    totalProduction: 11250,
    avgPerDay: 750,
    status: "completed"
  },
  { 
    id: 4, 
    name: "Walmart - Southpoint", 
    location: "San Antonio, TX", 
    dateRange: "Oct 25 - Nov 8",
    daysWorked: 11,
    totalLOAs: 16,
    totalProduction: 7480,
    avgPerDay: 680,
    status: "completed"
  },
  { 
    id: 5, 
    name: "Target - Riverside", 
    location: "Austin, TX", 
    dateRange: "Oct 5 - Oct 22",
    daysWorked: 13,
    totalLOAs: 19,
    totalProduction: 8930,
    avgPerDay: 687,
    status: "completed"
  },
  { 
    id: 6, 
    name: "Costco - Gateway", 
    location: "Dallas, TX", 
    dateRange: "Sep 15 - Oct 2",
    daysWorked: 14,
    totalLOAs: 22,
    totalProduction: 10340,
    avgPerDay: 738,
    status: "completed"
  },
];

export function StoreHistory() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStores = storeHistory.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Store History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date Range</TableHead>
              <TableHead>Days Worked</TableHead>
              <TableHead>Total LOAs</TableHead>
              <TableHead>Total Production</TableHead>
              <TableHead>Avg/Day</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.map((store) => (
              <TableRow key={store.id}>
                <TableCell className="font-medium">{store.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3 text-gray-400" />
                    {store.location}
                  </div>
                </TableCell>
                <TableCell>{store.dateRange}</TableCell>
                <TableCell>{store.daysWorked}</TableCell>
                <TableCell>{store.totalLOAs}</TableCell>
                <TableCell>${store.totalProduction.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    ${store.avgPerDay}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredStores.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No stores found matching your search.
          </div>
        )}
      </div>
    </Card>
  );
}

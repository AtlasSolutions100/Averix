import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useState } from "react";
import { Search } from "lucide-react";

const loaData = [
  { id: "LOA-2024-342", rep: "Sarah Johnson", store: "Target - Highland Mall", date: "2024-01-22", status: "active", value: 485 },
  { id: "LOA-2024-341", rep: "Mike Chen", store: "Walmart - Central Plaza", date: "2024-01-22", status: "active", value: 520 },
  { id: "LOA-2024-340", rep: "Emily Davis", store: "Costco - North Side", date: "2024-01-21", status: "completed", value: 450 },
  { id: "LOA-2024-339", rep: "James Wilson", store: "Target - Westgate", date: "2024-01-21", status: "completed", value: 395 },
  { id: "LOA-2024-338", rep: "Lisa Martinez", store: "Sam's Club - East End", date: "2024-01-21", status: "active", value: 510 },
  { id: "LOA-2024-337", rep: "David Brown", store: "Walmart - Southpoint", date: "2024-01-20", status: "completed", value: 475 },
  { id: "LOA-2024-336", rep: "Amanda Garcia", store: "Target - Riverside", date: "2024-01-20", status: "pending", value: 430 },
  { id: "LOA-2024-335", rep: "Chris Lee", store: "Costco - Gateway", date: "2024-01-19", status: "completed", value: 465 },
  { id: "LOA-2024-334", rep: "Rachel Kim", store: "Walmart - Downtown", date: "2024-01-19", status: "active", value: 490 },
  { id: "LOA-2024-333", rep: "Tom Anderson", store: "Target - Lakeside", date: "2024-01-18", status: "completed", value: 385 },
];

export function LOATracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredLOAs = loaData.filter(loa => {
    const matchesSearch = loa.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loa.rep.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          loa.store.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || loa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">LOA Tracking</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search LOAs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>LOA ID</TableHead>
              <TableHead>Sales Rep</TableHead>
              <TableHead>Store Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLOAs.map((loa) => (
              <TableRow key={loa.id}>
                <TableCell className="font-medium">{loa.id}</TableCell>
                <TableCell>{loa.rep}</TableCell>
                <TableCell>{loa.store}</TableCell>
                <TableCell>{loa.date}</TableCell>
                <TableCell>${loa.value}</TableCell>
                <TableCell>
                  <Badge
                    variant={loa.status === "completed" ? "default" : "secondary"}
                    className={
                      loa.status === "active" ? "bg-green-600" :
                      loa.status === "completed" ? "bg-blue-600" :
                      "bg-yellow-600"
                    }
                  >
                    {loa.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLOAs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No LOAs found matching your criteria.
          </div>
        )}
      </div>
    </Card>
  );
}

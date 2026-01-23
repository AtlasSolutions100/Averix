import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const repData = [
  { id: 1, name: "Sarah Johnson", office: "Houston", loas: 32, production: 15680, trend: "up", change: "+18%" },
  { id: 2, name: "Mike Chen", office: "Houston", loas: 28, production: 13240, trend: "up", change: "+12%" },
  { id: 3, name: "Emily Davis", office: "Dallas", loas: 26, production: 12450, trend: "stable", change: "+2%" },
  { id: 4, name: "James Wilson", office: "Dallas", loas: 24, production: 11890, trend: "up", change: "+8%" },
  { id: 5, name: "Lisa Martinez", office: "Austin", loas: 23, production: 11200, trend: "down", change: "-5%" },
  { id: 6, name: "David Brown", office: "Houston", loas: 22, production: 10560, trend: "up", change: "+15%" },
  { id: 7, name: "Amanda Garcia", office: "San Antonio", loas: 21, production: 9870, trend: "stable", change: "0%" },
  { id: 8, name: "Chris Lee", office: "Dallas", loas: 20, production: 9450, trend: "up", change: "+6%" },
  { id: 9, name: "Rachel Kim", office: "Austin", loas: 19, production: 8920, trend: "down", change: "-3%" },
  { id: 10, name: "Tom Anderson", office: "San Antonio", loas: 18, production: 8340, trend: "stable", change: "+1%" },
];

export function RepPerformance() {
  const [selectedOffice, setSelectedOffice] = useState("all");

  const filteredReps = selectedOffice === "all" 
    ? repData 
    : repData.filter(rep => rep.office === selectedOffice);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sales Rep Performance</h3>
        <Select value={selectedOffice} onValueChange={setSelectedOffice}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offices</SelectItem>
            <SelectItem value="Houston">Houston Office</SelectItem>
            <SelectItem value="Dallas">Dallas Office</SelectItem>
            <SelectItem value="Austin">Austin Office</SelectItem>
            <SelectItem value="San Antonio">San Antonio Office</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Rep Name</TableHead>
            <TableHead>Office</TableHead>
            <TableHead>LOAs (MTD)</TableHead>
            <TableHead>Production</TableHead>
            <TableHead>Trend</TableHead>
            <TableHead>Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredReps.map((rep, index) => (
            <TableRow key={rep.id}>
              <TableCell>
                <Badge variant="outline">#{index + 1}</Badge>
              </TableCell>
              <TableCell className="font-medium">{rep.name}</TableCell>
              <TableCell>{rep.office}</TableCell>
              <TableCell>{rep.loas}</TableCell>
              <TableCell>${rep.production.toLocaleString()}</TableCell>
              <TableCell>
                {rep.trend === "up" && <TrendingUp className="size-5 text-green-600" />}
                {rep.trend === "down" && <TrendingDown className="size-5 text-red-600" />}
                {rep.trend === "stable" && <Minus className="size-5 text-gray-400" />}
              </TableCell>
              <TableCell>
                <span className={
                  rep.trend === "up" ? "text-green-600" : 
                  rep.trend === "down" ? "text-red-600" : 
                  "text-gray-600"
                }>
                  {rep.change}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

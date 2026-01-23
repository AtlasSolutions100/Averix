import { Card } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const officeData = [
  { office: "Dallas Office", reps: 6, loas: 89, production: 42300, status: "excellent" },
  { office: "Houston Office", reps: 8, loas: 112, production: 56780, status: "excellent" },
  { office: "Austin Office", reps: 5, loas: 67, production: 31200, status: "good" },
  { office: "San Antonio Office", reps: 5, loas: 74, production: 26500, status: "good" },
];

const chartData = [
  { month: "Aug", loas: 285, production: 132000 },
  { month: "Sep", loas: 298, production: 141500 },
  { month: "Oct", loas: 312, production: 148200 },
  { month: "Nov", loas: 328, production: 152300 },
  { month: "Dec", loas: 342, production: 156780 },
];

export function OfficeOverview() {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Production Trends (Last 5 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="loas" fill="#3b82f6" name="LOAs" />
            <Bar yAxisId="right" dataKey="production" fill="#10b981" name="Production ($)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Office Performance</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Office</TableHead>
              <TableHead>Active Reps</TableHead>
              <TableHead>Total LOAs</TableHead>
              <TableHead>Production</TableHead>
              <TableHead>Avg Per Rep</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officeData.map((office) => (
              <TableRow key={office.office}>
                <TableCell className="font-medium">{office.office}</TableCell>
                <TableCell>{office.reps}</TableCell>
                <TableCell>{office.loas}</TableCell>
                <TableCell>${office.production.toLocaleString()}</TableCell>
                <TableCell>${Math.round(office.production / office.reps).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge
                    variant={office.status === "excellent" ? "default" : "secondary"}
                    className={office.status === "excellent" ? "bg-green-600" : "bg-blue-600"}
                  >
                    {office.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

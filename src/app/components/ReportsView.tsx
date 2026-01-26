import { useState } from "react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function ReportsView() {
  const [reportType, setReportType] = useState("performance");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [format, setFormat] = useState("pdf");

  const handleExport = () => {
    toast.success("Report exported successfully!", {
      description: `Your ${reportType} report has been downloaded as ${format.toUpperCase()}`
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Export Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="performance">Performance Summary</SelectItem>
                <SelectItem value="loa">LOA Analysis</SelectItem>
                <SelectItem value="store">Store Breakdown</SelectItem>
                <SelectItem value="rep">Rep Comparison</SelectItem>
                <SelectItem value="revenue">Revenue Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Button onClick={handleExport} className="mt-6">
          <Download className="size-4 mr-2" />
          Export Report
        </Button>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="size-6 text-blue-600" />
            </div>
          </div>
          <h4 className="font-semibold mb-1">Weekly Performance</h4>
          <p className="text-sm text-gray-600 mb-3">Last 7 days summary</p>
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="size-4 mr-2" />
            Generate
          </Button>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="size-6 text-green-600" />
            </div>
          </div>
          <h4 className="font-semibold mb-1">Monthly Summary</h4>
          <p className="text-sm text-gray-600 mb-3">Full month breakdown</p>
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="size-4 mr-2" />
            Generate
          </Button>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="size-6 text-purple-600" />
            </div>
          </div>
          <h4 className="font-semibold mb-1">Custom Report</h4>
          <p className="text-sm text-gray-600 mb-3">Choose your date range</p>
          <Button variant="outline" size="sm" className="w-full">
            <FileText className="size-4 mr-2" />
            Generate
          </Button>
        </Card>
      </div>

      {/* Report Preview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Report Preview</h3>
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <FileText className="size-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2">Select a report type and date range</p>
          <p className="text-sm text-gray-500">Your report preview will appear here</p>
        </div>
      </Card>
    </div>
  );
}

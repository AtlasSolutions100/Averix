import { Card } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Slider } from "@/app/components/ui/slider";

export function LOAAnalyzerView() {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">LOA Analyzer</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* LOA Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">LOA Metrics</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Contacts / Sale</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Avg Needed: 7.0</span>
                    <span className="text-xs text-gray-500">Jake's Actual: 6.2</span>
                    <span className="text-sm font-semibold text-red-600">Gap: -0.6</span>
                  </div>
                </div>
                <Progress value={88} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pres / Sale</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Avg Needed: 3.0</span>
                    <span className="text-xs text-gray-500">Jake's Actual: 3.2</span>
                    <span className="text-sm font-semibold text-green-600">Gap: -0.2</span>
                  </div>
                </div>
                <Progress value={94} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Stops / Contact</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">Avg Needed: 1.8</span>
                    <span className="text-xs text-gray-500">Jake's Actual: 1.3</span>
                    <span className="text-sm font-semibold text-red-600">Gap: -0.5</span>
                  </div>
                </div>
                <Progress value={72} className="h-2" />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-semibold mb-4">Adjust Targets</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Increase Contacts +$ / Day</label>
                  <Slider defaultValue={[0]} max={18} step={1} className="mt-2" />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Improve Close Rate +2%</label>
                  <Slider defaultValue={[2]} max={10} step={1} className="mt-2" />
                </div>
              </div>
            </div>
          </Card>

          {/* Projected Impact */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Projected Impact</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-2">Weekly Revenue</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-semibold">$16,450</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded font-semibold text-sm">
                    +$1,680
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold text-sm">
                    +$1,820
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Monthly Revenue</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-semibold">$67,200</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded font-semibold text-sm">
                    +$3,670
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded font-semibold text-sm">
                    +$7,920
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t">
              <h4 className="font-semibold mb-4">Key Insights</h4>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Strong Performance:</strong> Jake R. is performing above average in contacts per sale ratio.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Opportunity:</strong> Increasing stops per contact could improve overall conversion rate.
                  </p>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Target:</strong> With improved metrics, projected to reach $67K+ monthly revenue.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Product Mix */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Product Mix</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Product A</span>
                <span className="text-sm font-semibold">30%</span>
              </div>
              <Progress value={30} className="h-3" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Product B</span>
                <span className="text-sm font-semibold">30%</span>
              </div>
              <Progress value={30} className="h-3" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Product C</span>
                <span className="text-sm font-semibold">10%</span>
              </div>
              <Progress value={10} className="h-3" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

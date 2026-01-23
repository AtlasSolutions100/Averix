import { Card } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { MapPin, Calendar, TrendingUp, FileText } from "lucide-react";

const currentStores = [
  { 
    id: 1, 
    name: "Target - Highland Mall", 
    location: "Austin, TX", 
    startDate: "2024-01-15",
    daysWorked: 8,
    loasToday: 3,
    productionToday: 1285,
    totalProduction: 4850,
    status: "active"
  },
  { 
    id: 2, 
    name: "Walmart - Central Plaza", 
    location: "Austin, TX", 
    startDate: "2024-01-10",
    daysWorked: 13,
    loasToday: 2,
    productionToday: 980,
    totalProduction: 7600,
    status: "active"
  },
];

export function MyStores() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {currentStores.map((store) => (
        <Card key={store.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{store.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <MapPin className="size-4" />
                  {store.location}
                </div>
              </div>
              <Badge className="bg-green-600">{store.status}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="size-4" />
                  Started
                </div>
                <p className="font-semibold">{store.startDate}</p>
                <p className="text-sm text-gray-600">{store.daysWorked} days worked</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FileText className="size-4" />
                  LOAs Today
                </div>
                <p className="font-semibold text-2xl">{store.loasToday}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <TrendingUp className="size-4" />
                  Today's Production
                </div>
                <p className="font-semibold text-xl text-green-600">${store.productionToday}</p>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Production</div>
                <p className="font-semibold text-xl text-blue-600">${store.totalProduction.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Performance</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${(store.totalProduction / 10000) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{Math.round((store.totalProduction / 10000) * 100)}%</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Target: $10,000</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

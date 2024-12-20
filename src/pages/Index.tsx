import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/dashboard/Card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockData = [
  { name: "Jan", price: 400 },
  { name: "Feb", price: 300 },
  { name: "Mar", price: 600 },
  { name: "Apr", price: 800 },
  { name: "May", price: 700 },
];

const Index = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary-600 mb-2">Welcome to AgriSmart</h1>
          <p className="text-gray-600">Your intelligent farming assistant</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="Market Prices"
            description="Current crop market trends"
            className="col-span-full lg:col-span-2"
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#2D5A27"
                    strokeWidth={2}
                    dot={{ fill: "#2D5A27" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="AI Insights" description="Smart recommendations">
            <div className="space-y-4">
              <div className="p-4 bg-primary-100 rounded-md">
                <p className="text-primary-600 font-medium">Optimal Planting Time</p>
                <p className="text-sm text-primary-700 mt-1">
                  Based on weather forecasts, ideal planting window: Next Week
                </p>
              </div>
              <div className="p-4 bg-primary-100 rounded-md">
                <p className="text-primary-600 font-medium">Market Prediction</p>
                <p className="text-sm text-primary-700 mt-1">
                  Corn prices expected to rise by 5% in the next month
                </p>
              </div>
            </div>
          </Card>

          <Card
            title="Weather Forecast"
            description="7-day prediction"
            className="col-span-full md:col-span-1"
          >
            <div className="space-y-3">
              {["Mon", "Tue", "Wed"].map((day) => (
                <div key={day} className="flex items-center justify-between p-2 border-b">
                  <span className="font-medium">{day}</span>
                  <span className="text-primary-600">23°C</span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Tasks"
            description="Upcoming activities"
            className="col-span-full md:col-span-1"
          >
            <div className="space-y-3">
              {["Check soil moisture", "Apply fertilizer", "Inspect crops"].map((task) => (
                <div key={task} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-primary-300" />
                  <span>{task}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
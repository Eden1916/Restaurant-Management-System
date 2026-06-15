import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CheckCircle, Clock } from "lucide-react";

export default function ChefDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const stats = [
    { label: "Pending Orders", value: 0, icon: Clock, color: "bg-amber-500" },
    { label: "In Progress", value: 0, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Completed Today", value: 0, icon: CheckCircle, color: "bg-green-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Kitchen Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, Chef {user.username} — manage incoming orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Orders queue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-red-950 mb-4">Orders Queue</h2>
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No orders in queue</p>
            <p className="text-sm mt-1">New orders will appear here</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

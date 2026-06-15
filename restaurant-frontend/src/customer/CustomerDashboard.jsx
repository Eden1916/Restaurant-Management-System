import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CalendarDays, UtensilsCrossed, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const quickActions = [
    { label: "Browse Menu", icon: UtensilsCrossed, path: "/customer/menu", color: "bg-red-950" },
    { label: "My Orders", icon: ShoppingBag, path: "/customer/orders", color: "bg-red-800" },
    { label: "Reservations", icon: CalendarDays, path: "/customer/reservations", color: "bg-red-700" },
    { label: "Order History", icon: Clock, path: "/customer/orders", color: "bg-red-600" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">
            Welcome back, {user.username} 👋
          </h1>
          <p className="text-gray-500 mt-1">What would you like to do today?</p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white rounded-xl p-5 flex flex-col items-center gap-3 shadow hover:opacity-90 transition`}
              >
                <Icon className="w-8 h-8" />
                <span className="font-medium text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Recent orders placeholder */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-950 mb-4">Recent Orders</h2>
          <div className="text-center py-10 text-gray-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No recent orders yet</p>
            <button
              onClick={() => navigate("/customer/menu")}
              className="mt-3 bg-red-950 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-800 transition"
            >
              Order Now
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

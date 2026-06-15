import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CalendarDays, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WaiterDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const quickActions = [
    { label: "View Orders", icon: ShoppingBag, path: "/waiter/orders", color: "bg-red-950" },
    { label: "Reservations", icon: CalendarDays, path: "/waiter/reservations", color: "bg-red-800" },
    { label: "Pending Tasks", icon: Clock, path: "/waiter/orders", color: "bg-red-700" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Welcome, {user.username} 👋</h1>
          <p className="text-gray-500 mt-1">Waiter Dashboard — manage orders and reservations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} onClick={() => navigate(action.path)}
                className={`${action.color} text-white rounded-xl p-6 flex flex-col items-center gap-3 shadow hover:opacity-90 transition`}>
                <Icon className="w-8 h-8" />
                <span className="font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-3">Active Orders</h2>
            <div className="text-center py-8 text-gray-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No active orders</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-3">Today's Reservations</h2>
            <div className="text-center py-8 text-gray-400">
              <CalendarDays className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No reservations today</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

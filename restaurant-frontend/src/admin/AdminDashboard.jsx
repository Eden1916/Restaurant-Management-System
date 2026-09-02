import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { Users, ShoppingBag, UtensilsCrossed, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, menuItems: 0, revenue: 0 });
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch users count
    fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats((s) => ({ ...s, users: d.users.length }));
      })
      .catch(() => {});

      // Fetch orders count
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats((s) => ({ ...s, orders: d.orders.length }));
      })
      .catch(() => {});

    // Fetch menu count
    fetch(`${import.meta.env.VITE_API_URL}/menu`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setStats((s) => ({ ...s, menuItems: d.length }));
      })
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Total Users", value: stats.users, icon: Users, color: "bg-blue-500" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "bg-green-500" },
    { label: "Menu Items", value: stats.menuItems, icon: UtensilsCrossed, color: "bg-red-950" },
    { label: "Revenue (ETB)", value: stats.revenue, icon: TrendingUp, color: "bg-amber-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your restaurant</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick links */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-2">Recent Orders</h2>
            <p className="text-gray-400 text-sm">No recent orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-2">Pending Reservations</h2>
            <p className="text-gray-400 text-sm">No pending reservations</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-2">Low Stock Items</h2>
            <p className="text-gray-400 text-sm">All items available</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

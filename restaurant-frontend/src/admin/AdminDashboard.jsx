import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { Users, ShoppingBag, UtensilsCrossed, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, orders: 0, menuItems: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStocks, setLowStocks] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch users count
    fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats((s) => ({ ...s, users: d.users.length })); })
      .catch(() => {});

    // Fetch menu count
    fetch(`${import.meta.env.VITE_API_URL}/menu`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setStats((s) => ({ ...s, menuItems: d.length })); })
      .catch(() => {});

    // Fetch orders, recent orders & revenue
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const totalRevenue = d.orders
            .filter((o) => o.payment_status === "completed")
            .reduce((acc, o) => acc + (parseFloat(o.total_amount) || 0), 0);
          setStats((s) => ({ ...s, revenue: totalRevenue.toFixed(2), orders: d.orders.length }));
          setRecentOrders(d.orders.slice(0, 3));
        }
      })
      .catch(() => {});

    // Fetch low stock reports
    fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setLowStocks(d.reports.slice(0, 3)); })
      .catch(() => {});

    // Fetch pending reservations
    fetch(`${import.meta.env.VITE_API_URL}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setPendingReservations(d.reservations.filter((r) => r.status === "pending"));
        }
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

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-3">Recent Orders</h2>
            {recentOrders.length === 0 ? (
              <p className="text-gray-400 text-sm">No recent orders</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{order.username}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-950">{order.total_amount} ETB</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'payment_verified' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Reservations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-3">Pending Reservations</h2>
            {pendingReservations.length === 0 ? (
              <p className="text-gray-400 text-sm">No pending reservations</p>
            ) : (
              <div className="space-y-3">
                {pendingReservations.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-red-950 text-sm">{item.username || "Customer"}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 capitalize">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.reservation_date).toLocaleDateString()} • {item.reservation_time}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.guests} guests</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-3">Low Stock Items</h2>
            {lowStocks.length === 0 ? (
              <p className="text-gray-400 text-sm">All items available</p>
            ) : (
              <div className="space-y-3">
                {lowStocks.map((stock) => (
                  <div key={stock.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-gray-800">{stock.item_name}</p>
                      <p className="text-xs text-gray-400">
                        {stock.current_quantity} {stock.unit || ""} — {stock.chef_name}
                      </p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize ${
                      stock.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    }`}>
                      {stock.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

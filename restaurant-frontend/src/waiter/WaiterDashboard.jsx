import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CalendarDays, Clock, CheckCircle } from "lucide-react";

const statusColors = {
  payment_verified: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  assigned: "bg-orange-100 text-orange-700",
};

export default function WaiterDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [activeOrders, setActiveOrders] = useState([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // Fetch active orders
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const active = d.orders.filter((o) =>
            ["payment_verified", "preparing", "ready"].includes(o.status)
          );
          setActiveOrders(active);
        }
      })
      .catch(() => {});

    // Fetch today's reservations
    fetch(`${import.meta.env.VITE_API_URL}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const todayRes = d.reservations.filter((r) => {
            // Use local date parts to avoid UTC timezone shift issues
            const d = new Date(r.reservation_date);
            const resDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return resDate === today;
          });
          setTodayReservations(todayRes);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Active Orders", value: activeOrders.length, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Today's Reservations", value: todayReservations.length, icon: CalendarDays, color: "bg-amber-500" },
    {
      label: "Ready to Deliver",
      value: activeOrders.filter((o) => o.status === "ready").length,
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Preparing",
      value: activeOrders.filter((o) => o.status === "preparing").length,
      icon: Clock,
      color: "bg-orange-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Waiter Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, {user.username} — here's your shift overview</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {loading ? "—" : stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Active Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-4">Active Orders</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No active orders right now</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between text-sm border-b border-gray-50 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">Order #{order.id}</p>
                      <p className="text-xs text-gray-500">{order.username}</p>
                      <p className="text-xs text-gray-400">
                        {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} •{" "}
                        {parseFloat(order.total_amount).toFixed(2)} ETB
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        statusColors[order.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
                {activeOrders.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    +{activeOrders.length - 5} more orders
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Today's Reservations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-red-950 mb-4">Today's Reservations</h2>
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : todayReservations.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reservations for today</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayReservations.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm border-b border-gray-50 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.username || "Customer"}</p>
                      <p className="text-xs text-gray-500">
                        {item.reservation_time} • {item.guests} guest{item.guests !== 1 ? "s" : ""}
                      </p>
                      {item.table_number && (
                        <p className="text-xs text-green-700 font-medium">Table {item.table_number}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                        statusColors[item.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
                {todayReservations.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    +{todayReservations.length - 5} more reservations
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

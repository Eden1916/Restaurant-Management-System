import DashboardLayout from "../shared/DashboardLayout";
import { FileText, TrendingUp, ShoppingBag, Users, UtensilsCrossed, CalendarDays, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminReports() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0 });
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Fetch orders
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const totalRevenue = d.orders
            .filter((o) => o.payment_status === "completed")
            .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
          setStats((s) => ({ ...s, revenue: totalRevenue.toFixed(2), orders: d.orders.length }));
          setOrders(d.orders);
        }
      })
      .catch(() => {});

    // Fetch users
    fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const customers = d.users.filter((u) => u.role === "customer");
          setStats((s) => ({ ...s, customers: customers.length }));
          setUsers(d.users);
        }
      })
      .catch(() => {});

    // Fetch reservations
    fetch(`${import.meta.env.VITE_API_URL}/reservations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setReservations(d.reservations); })
      .catch(() => {});
  }, []);

  // ── Derived data ──

  // Orders by status
  const ordersByStatus = orders.reduce((acc, o) => {
    const s = o.status || "unknown";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Orders by type
  const ordersByType = orders.reduce((acc, o) => {
    const t = o.order_type || "unknown";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Payment method breakdown
  const byPaymentMethod = orders.reduce((acc, o) => {
    const m = o.payment_method || "unknown";
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});

  // Top menu items (from order items aggregated)
  const itemCounts = {};
  orders.forEach((o) => {
    o.items?.forEach((item) => {
      if (!itemCounts[item.name]) itemCounts[item.name] = { qty: 0, revenue: 0 };
      itemCounts[item.name].qty += item.quantity;
      itemCounts[item.name].revenue += item.price * item.quantity;
    });
  });
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  // Daily sales (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  const dailySales = last7Days.map((date) => {
    const dayOrders = orders.filter(
      (o) => o.created_at?.split("T")[0] === date && o.payment_status === "completed"
    );
    return {
      date,
      count: dayOrders.length,
      revenue: dayOrders.reduce((s, o) => s + parseFloat(o.total_amount || 0), 0).toFixed(2),
    };
  });

  // Reservation summary
  const resvByStatus = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  // New customers this month
  const thisMonth = new Date().toISOString().slice(0, 7);
  const newCustomers = users.filter(
    (u) => u.role === "customer" && u.created_at?.slice(0, 7) === thisMonth
  ).length;

  const reportCards = [
    { label: "Total Revenue (ETB)", value: stats.revenue, icon: TrendingUp, color: "bg-green-500" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingBag, color: "bg-blue-500" },
    { label: "Total Customers", value: stats.customers, icon: Users, color: "bg-red-950" },
    { label: "New Customers (This Month)", value: newCustomers, icon: Users, color: "bg-purple-500" },
  ];

  const statusColors = {
    pending_payment: "bg-yellow-100 text-yellow-700",
    payment_verified: "bg-blue-100 text-blue-700",
    preparing: "bg-orange-100 text-orange-700",
    ready: "bg-cyan-100 text-cyan-700",
    completed: "bg-green-100 text-green-700",
    payment_failed: "bg-red-100 text-red-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Reports</h1>
          <p className="text-gray-500 mt-1">Restaurant performance overview</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {reportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{card.value ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Daily Sales — last 7 days */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Daily Sales (Last 7 Days)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Orders</th>
                  <th className="text-left px-4 py-2 text-gray-500 font-medium">Revenue (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dailySales.map((day) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{day.date}</td>
                    <td className="px-4 py-2 text-gray-700">{day.count}</td>
                    <td className="px-4 py-2 font-medium text-red-950">{day.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Selling Items */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5" /> Top Selling Items
            </h2>
            {topItems.length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topItems.map(([name, data], i) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-red-950 text-white text-xs flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-700">{name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">{data.qty} sold</p>
                      <p className="text-xs text-gray-400">{data.revenue.toFixed(2)} ETB</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" /> Orders by Status
            </h2>
            {Object.keys(ordersByStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[status] || "bg-gray-100 text-gray-700"}`}>
                      {status.replace(/_/g, " ")}
                    </span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders by Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" /> Orders by Type
            </h2>
            {Object.keys(ordersByType).length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(ordersByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{type.replace(/_/g, " ")}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-red-950 h-2 rounded-full"
                          style={{ width: `${(count / orders.length) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Payment Methods
            </h2>
            {Object.keys(byPaymentMethod).length === 0 ? (
              <p className="text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byPaymentMethod).map(([method, count]) => (
                  <div key={method} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{method.replace(/_/g, " ")}</span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reservation Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Reservation Summary
            </h2>
            {Object.keys(resvByStatus).length === 0 ? (
              <p className="text-gray-400 text-sm">No reservations yet</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(resvByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 capitalize">{status}</span>
                    <span className="font-semibold text-gray-800">{count}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Total</span>
                  <span className="font-bold text-red-950">{reservations.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

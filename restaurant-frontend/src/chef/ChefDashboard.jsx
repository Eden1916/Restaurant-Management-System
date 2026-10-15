import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

const statusConfig = {
  payment_verified: { label: "New Order", color: "bg-blue-100 text-blue-700", border: "border-blue-500" },
  preparing:        { label: "Preparing",  color: "bg-orange-100 text-orange-700", border: "border-orange-500" },
};

export default function ChefDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, inProgress: 0, completedToday: 0 });
  const [loading, setLoading] = useState(true);

  function fetchOrders() {
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

          const pending = d.orders.filter((o) => o.status === "payment_verified").length;
          const inProgress = d.orders.filter((o) => o.status === "preparing").length;
          const completedToday = d.orders.filter((o) => {
            if (o.status !== "completed") return false;
            const d2 = new Date(o.updated_at);
            const ds = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, "0")}-${String(d2.getDate()).padStart(2, "0")}`;
            return ds === todayStr;
          }).length;

          setCounts({ pending, inProgress, completedToday });
          setOrders(d.orders.filter((o) => ["payment_verified", "preparing"].includes(o.status)));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  async function updateStatus(orderId, status) {
    await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    });
    fetchOrders();
  }

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    { label: "Pending Orders",  value: counts.pending,        icon: Clock,        color: "bg-amber-500" },
    { label: "In Progress",     value: counts.inProgress,     icon: ShoppingBag,  color: "bg-blue-500"  },
    { label: "Completed Today", value: counts.completedToday, icon: CheckCircle,  color: "bg-green-500" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Kitchen Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome, Chef {user.username} — manage incoming orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-xl shadow-sm p-5">
                <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{loading ? "—" : card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>

        {/* Orders Queue */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-red-950 mb-1">Orders Queue</h2>
          <p className="text-xs text-gray-400 mb-4">Showing latest 3 orders — see full list in Kitchen Orders</p>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
              <p>No orders in queue</p>
              <p className="text-sm mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.slice(0, 3).map((order) => {
                const config = statusConfig[order.status];
                return (
                  <div
                    key={order.id}
                    className={`border-l-4 ${config.border} bg-gray-50 rounded-xl p-4`}
                  >
                    {/* Order header */}
                    <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">Order #{order.id}</p>
                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        {order.status === "payment_verified" && (
                          <button
                            onClick={() => updateStatus(order.id, "preparing")}
                            className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-orange-600 transition"
                          >
                            Start Preparing
                          </button>
                        )}
                        {order.status === "preparing" && (
                          <button
                            onClick={() => updateStatus(order.id, "ready")}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2">
                          <span className="w-7 h-7 bg-red-950 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                            {item.quantity}
                          </span>
                          <span className="font-medium text-gray-800">{item.name}</span>
                          {item.special_instructions && (
                            <span className="text-xs text-amber-600 ml-auto">⚠ {item.special_instructions}</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Order-level special instructions */}
                    {order.special_instructions && (
                      <div className="mt-3 bg-amber-50 rounded-lg px-3 py-2 text-sm text-amber-700">
                        Note: {order.special_instructions}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

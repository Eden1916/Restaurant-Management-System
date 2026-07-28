import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag } from "lucide-react";

const statusConfig = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-700" },
  payment_verified: { label: "Payment Verified", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700" },
  ready: { label: "Ready", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700" },
  payment_failed: { label: "Payment Failed", color: "bg-red-100 text-red-700" },
};

export default function ChefOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => { fetchOrders(); }, []);

  function fetchOrders() {
    fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrders(d.orders); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function markPreparing(orderId) {
    await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "preparing" }),
    });
    fetchOrders();
  }

  async function markReady(orderId) {
    await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "ready" }),
    });
    fetchOrders();
  }

  // Chef sees payment_verified (new) and preparing orders
  const kitchenOrders = orders.filter((o) =>
    ["payment_verified", "preparing"].includes(o.status)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Kitchen Orders</h1>
          <p className="text-gray-500 mt-1">Prepare and manage incoming orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-2xl font-bold text-gray-800">
              {orders.filter((o) => o.status === "payment_verified").length}
            </p>
            <p className="text-sm text-gray-500 mt-1">New Orders</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <p className="text-2xl font-bold text-gray-800">
              {orders.filter((o) => o.status === "preparing").length}
            </p>
            <p className="text-sm text-gray-500 mt-1">In Progress</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : kitchenOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
            <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No orders in queue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {kitchenOrders.map((order) => {
              const config = statusConfig[order.status];
              return (
                <div key={order.id} className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                  order.status === "payment_verified" ? "border-blue-500" : "border-orange-500"
                }`}>
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      {order.status === "payment_verified" && (
                        <button onClick={() => markPreparing(order.id)}
                          className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-orange-600 transition">
                          Start Preparing
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button onClick={() => markReady(order.id)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition">
                          Mark Ready
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Items — most important for chef */}
                  <div className="space-y-2">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
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
    </DashboardLayout>
  );
}

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

export default function WaiterOrders() {
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

  async function markReady(orderId) {
    await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: "completed" }),
    });
    fetchOrders();
  }

  // Waiter sees ready and preparing orders primarily
  const activeOrders = orders.filter((o) =>
    ["payment_verified", "preparing", "ready"].includes(o.status)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Orders</h1>
          <p className="text-gray-500 mt-1">Active customer orders</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : activeOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
            <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No active orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending_payment;
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">Customer: {order.username}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      {order.status === "ready" && (
                        <button onClick={() => markReady(order.id)}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition">
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items?.map((item, i) => (
                      <div key={i} className="text-sm text-gray-600">
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="text-sm text-gray-500 capitalize">
                      {order.order_type?.replace("_", " ")}
                    </span>
                    <p className="font-bold text-red-950">{order.total_amount} ETB</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CheckCircle, Clock, XCircle, ChefHat } from "lucide-react";

const statusConfig = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-700" },
  payment_verified: { label: "Payment Verified", color: "bg-blue-100 text-blue-700" },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700" },
  ready: { label: "Ready", color: "bg-green-100 text-green-700" },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700" },
  payment_failed: { label: "Payment Failed", color: "bg-red-100 text-red-700" },
};

const NEXT_STATUS = {
  payment_verified: "preparing",
  preparing: "ready",
  ready: "completed",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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

  async function updateStatus(orderId, newStatus) {
    await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchOrders();
  }

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-red-950">All Orders</h1>
            <p className="text-gray-500 mt-1">Manage and track customer orders</p>
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950">
            <option value="all">All Orders</option>
            <option value="payment_verified">Payment Verified</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="payment_failed">Failed</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
            <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending_payment;
              const nextStatus = NEXT_STATUS[order.status];
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-sm text-gray-500">Customer: {order.username}</p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      {nextStatus && (
                        <button onClick={() => updateStatus(order.id, nextStatus)}
                          className="bg-red-950 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-800 transition">
                          Mark as {statusConfig[nextStatus]?.label}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} ETB</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-500 capitalize">
                      {order.order_type?.replace("_", " ")}
                      {order.delivery_address && ` · ${order.delivery_address}`}
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

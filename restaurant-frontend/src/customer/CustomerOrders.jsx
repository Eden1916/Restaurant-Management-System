import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag, CheckCircle, Clock, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const statusConfig = {
  pending_payment: { label: "Pending Payment", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  payment_verified: { label: "Payment Verified", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  preparing: { label: "Preparing", color: "bg-orange-100 text-orange-700", icon: Clock },
  ready: { label: "Ready", color: "bg-green-100 text-green-700", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-700", icon: CheckCircle },
  payment_failed: { label: "Payment Failed", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function CustomerOrders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const paymentStatus = searchParams.get("payment");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>

        {/* Payment result banner */}
        {paymentStatus === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Payment successful!</p>
              <p className="text-sm">Your order has been confirmed and is being prepared.</p>
            </div>
          </div>
        )}
        {paymentStatus === "failed" && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
            <XCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Payment failed</p>
              <p className="text-sm">Your payment was not completed. Please try again.</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
              <p className="text-lg">No orders yet</p>
              <p className="text-sm mt-1">Browse our menu to place your first order</p>
              <button
                onClick={() => navigate("/customer/menu")}
                className="mt-4 bg-red-950 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-800 transition"
              >
                Browse Menu
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending_payment;
              const Icon = config.icon;
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.id}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                      {config.label}
                    </span>
                  </div>

                  {/* Order items */}
                  <div className="space-y-2 mb-4">
                    {order.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-gray-600">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} ETB</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-500 capitalize">
                      {order.order_type?.replace("_", " ")} · {order.payment_method?.replace("_", " ")}
                    </div>
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

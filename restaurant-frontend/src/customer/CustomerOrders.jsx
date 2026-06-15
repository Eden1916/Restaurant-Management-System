import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerOrders() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">My Orders</h1>
          <p className="text-gray-500 mt-1">Track and manage your orders</p>
        </div>

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
      </div>
    </DashboardLayout>
  );
}

import DashboardLayout from "../shared/DashboardLayout";
import { ShoppingBag } from "lucide-react";

export default function ChefOrders() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Kitchen Orders</h1>
          <p className="text-gray-500 mt-1">Prepare and manage incoming orders</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
          <ShoppingBag className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p>No orders in queue</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

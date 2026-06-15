import DashboardLayout from "../shared/DashboardLayout";
import { CalendarDays } from "lucide-react";

export default function WaiterReservations() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Reservations</h1>
          <p className="text-gray-500 mt-1">Manage table reservations</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
          <CalendarDays className="w-14 h-14 mx-auto mb-3 opacity-30" />
          <p>No reservations</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

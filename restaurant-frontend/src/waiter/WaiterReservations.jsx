import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { CalendarDays } from "lucide-react";
import { getReservations } from "../api/reservation";

export default function WaiterReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    setReservations(getReservations());
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Reservations</h1>
          <p className="text-gray-500 mt-1">Manage table reservations</p>
        </div>
        {reservations.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            {reservations.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-red-950">{item.userName || "Customer"}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 capitalize">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.date} • {item.time}</p>
                <p className="text-sm text-gray-500 mt-1">{item.guests} guests</p>
                {item.note ? <p className="text-sm text-gray-500 mt-1">{item.note}</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
            <CalendarDays className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No reservations</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

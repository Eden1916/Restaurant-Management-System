import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { CalendarDays } from "lucide-react";

export default function WaiterReservations() {
  const [reservations, setReservations] = useState([]);
  const token = localStorage.getItem('token')


  useEffect(() => {
  fetch(`${import.meta.env.VITE_API_URL}/reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((d) => { if (d.success) setReservations(d.reservations); });
}, []);

async function updateStatus(id, status) {
  await fetch(`${import.meta.env.VITE_API_URL}/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status }),
  });
  // Re-fetch to refresh the list
  fetch(`${import.meta.env.VITE_API_URL}/reservations`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((d) => { if (d.success) setReservations(d.reservations); });
}


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
                  <p className="font-semibold text-red-950">{item.username || "Customer"}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 capitalize">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.reservation_date} • {item.reservation_time}</p>
                <p className="text-sm text-gray-500 mt-1">{item.guests} guests</p>
                {item.special_requests ? <p className="text-sm text-gray-500 mt-1">{item.special_requests}</p> : null}
                {item.status === "pending" && (
  <div className="flex gap-2 mt-3">
    <button onClick={() => updateStatus(item.id, "approved")}
      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-700">
      Approve
    </button>
    <button onClick={() => updateStatus(item.id, "rejected")}
      className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-700">
      Reject
    </button>
  </div>
)}
{item.status === "approved" && (
  <button onClick={() => updateStatus(item.id, "completed")}
    className="mt-3 bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs hover:bg-gray-300">
    Mark Completed
  </button>
)}
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

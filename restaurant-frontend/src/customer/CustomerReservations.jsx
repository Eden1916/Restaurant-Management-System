import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { CalendarDays } from "lucide-react";

// Generate time slots 07:00 AM – 09:00 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 21; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const period = hour < 12 ? "AM" : "PM";
      const displayHour = hour > 12 ? hour - 12 : hour;
      const label = `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      slots.push({ label, value });
    }
  }
  return slots;
};

export default function CustomerReservations() {
  const [form, setForm] = useState({ date: "", time: "", guests: 1, special_requests: "" });
  const [submitted, setSubmitted] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timeSlots = generateTimeSlots();
  const token = localStorage.getItem("token")

  const loadReservations = () => {
  fetch(`${import.meta.env.VITE_API_URL}/reservations/my`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.json())
    .then((d) => { if (d.success) setReservations(d.reservations); });
};
useEffect(() => {
  loadReservations()
}, [])

  async function handleSubmit(e) {
  e.preventDefault();
  setIsSubmitting(true);
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        reservation_date: form.date,
        reservation_time: form.time,
        guests: Number(form.guests),
        special_requests: form.special_requests,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSubmitted(true);
      setForm({ date: "", time: "", guests: "", special_requests: "" });
      loadReservations();
    } else {
      alert(data.error || "Failed to book reservation");
    }
  } catch {
    alert("Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
}


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Reservations</h1>
          <p className="text-gray-500 mt-1">Book a table at Liyu Restaurant</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Booking form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5" /> Book a Table
            </h2>
            {submitted && (
              <div className="mb-4 bg-green-50 text-green-700 rounded-lg p-3 text-sm">
                Reservation request sent successfully!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time (07:00 AM – 09:00 PM)</label>
                <select
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950">
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={form.guests}
                  onChange={(e) => setForm({ ...form, guests: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                <textarea
                  rows={3}
                  value={form.special_requests}
                  onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                  placeholder="Any dietary requirements or special requests..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-950 text-white py-2.5 rounded-lg font-medium hover:bg-red-800 transition disabled:opacity-70">
                {isSubmitting ? "Booking..." : "Book Table"}
              </button>
            </form>
          </div>

          {/* My reservations */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4">My Reservations</h2>
            {reservations.length > 0 ? (
              <div className="space-y-3">
                {reservations.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-red-950">{item.reservation_date} • {item.reservation_time}</p>
                      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${
  item.status === 'approved' ? 'bg-green-100 text-green-700' :
  item.status === 'assigned' ? 'bg-orange-100 text-orange-700' :
  item.status === 'rejected' ? 'bg-red-100 text-red-700' :
  item.status === 'completed' ? 'bg-gray-100 text-gray-700' :
  'bg-amber-100 text-amber-700'
}`}>
  {item.status}
</span>

                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.guests} guests</p>
                    {item.table_number && (
                      <p className="text-sm text-green-700 font-medium mt-1">Table {item.table_number} assigned</p>
                    )}
                    {item.special_requests ? <p className="text-sm text-gray-500 mt-1">{item.special_requests}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No reservations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

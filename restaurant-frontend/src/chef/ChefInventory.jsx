import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { AlertTriangle, Plus, Check } from "lucide-react";

const emptyForm = { item_name: "", current_quantity: "", unit: "", notes: "" };

const UNITS = ["kg", "g", "liters", "ml", "pieces", "boxes", "bags", "bottles", "cans"];

export default function ChefInventory() {
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myReports, setMyReports] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => { fetchMyReports(); }, []);

  function fetchMyReports() {
    fetch(`${import.meta.env.VITE_API_URL}/inventory/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setMyReports(d.reports); })
      .catch(() => {});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm(emptyForm);
        fetchMyReports();
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        alert(data.error || "Failed to submit report");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-950">Low Stock Reports</h1>
          <p className="text-gray-500 mt-1">Report items that are running low in the kitchen</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Report form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Report Low Stock
            </h2>

            {submitted && (
              <div className="mb-4 bg-green-50 text-green-700 rounded-lg p-3 text-sm flex items-center gap-2">
                <Check className="w-4 h-4" /> Report submitted successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={form.item_name}
                  onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                  placeholder="e.g. Tomatoes, Cooking Oil, Salt..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
                  <input
                    value={form.current_quantity}
                    onChange={(e) => setForm({ ...form, current_quantity: e.target.value })}
                    placeholder="e.g. 2"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                  >
                    <option value="">Select unit</option>
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional details about the shortage..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-950 text-white py-2.5 rounded-xl font-medium hover:bg-red-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>

          {/* My recent reports */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4">My Reports</h2>
            {myReports.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <AlertTriangle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No reports submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myReports.map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">{r.item_name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                    {r.current_quantity && (
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {r.current_quantity} {r.unit}
                      </p>
                    )}
                    {r.notes && <p className="text-sm text-gray-400 mt-1 italic">"{r.notes}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

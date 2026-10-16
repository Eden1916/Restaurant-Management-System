import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { AlertTriangle, Check } from "lucide-react";

export default function AdminInventory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const token = localStorage.getItem("token");

  useEffect(() => { fetchReports(); }, []);

  function fetchReports() {
    fetch(`${import.meta.env.VITE_API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d.success) setReports(d.reports); setLoading(false); })
      .catch(() => setLoading(false));
  }

  async function handleResolve(id) {
    await fetch(`${import.meta.env.VITE_API_URL}/inventory/${id}/resolve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchReports();
  }

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-red-950">Low Stock Reports</h1>
            <p className="text-gray-500 mt-1">Inventory alerts from the kitchen</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <span className="bg-amber-100 text-amber-700 text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> {pendingCount} pending
              </span>
            )}
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-950">
              <option value="all">All Reports</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center py-16 text-gray-400">
            <AlertTriangle className="w-14 h-14 mx-auto mb-3 opacity-30" />
            <p>No reports found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Item</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Quantity</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Reported By</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{r.item_name}</p>
                      {r.notes && <p className="text-xs text-gray-400 mt-0.5 italic">"{r.notes}"</p>}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {r.current_quantity ? `${r.current_quantity} ${r.unit || ""}` : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{r.chef_name}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.status === "pending" && (
                        <button onClick={() => handleResolve(r.id)}
                          className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 transition">
                          <Check className="w-3 h-3" /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

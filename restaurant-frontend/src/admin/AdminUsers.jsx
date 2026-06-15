import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { Users, Shield } from "lucide-react";

const ROLES = ["customer", "waiter", "chef", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.users);
        else setError(d.message);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load users");
        setLoading(false);
      });
  }, []);

  async function handleRoleChange(userId, newRole) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message);
      }
    } catch {
      alert("Failed to update role");
    }
  }

  const roleBadge = {
    admin: "bg-red-100 text-red-700",
    chef: "bg-orange-100 text-orange-700",
    waiter: "bg-blue-100 text-blue-700",
    customer: "bg-gray-100 text-gray-700",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-950">Users</h1>
            <p className="text-gray-500 mt-1">Manage user accounts and roles</p>
          </div>
          <div className="flex items-center gap-2 bg-red-50 text-red-950 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Users className="w-4 h-4" />
            {users.length} users
          </div>
        </div>

        {loading && <div className="text-center py-16 text-gray-400">Loading users...</div>}
        {error && <div className="bg-red-50 text-red-700 rounded-xl p-4">{error}</div>}

        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Email</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-950 text-white flex items-center justify-center text-xs font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge[user.role] || "bg-gray-100 text-gray-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-950"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

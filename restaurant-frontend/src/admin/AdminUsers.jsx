import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { Users, Pencil, Trash2, Plus, X } from "lucide-react";

const ROLES = ["customer", "waiter", "chef", "admin"];
const emptyForm = { username: "", email: "", password: "", role: "customer" };

const roleBadge = {
  admin: "bg-red-100 text-red-700",
  chef: "bg-orange-100 text-orange-700",
  waiter: "bg-blue-100 text-blue-700",
  customer: "bg-gray-100 text-gray-700",
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => { fetchUsers(); }, []);

  function fetchUsers() {
    fetch(`${import.meta.env.VITE_API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setUsers(d.users);
        else setError(d.message);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load users"); setLoading(false); });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${import.meta.env.VITE_API_URL}/admin/users/${editId}`
      : `${import.meta.env.VITE_API_URL}/admin/users`;

    const body = { username: form.username, email: form.email, role: form.role };
    if (!editId || form.password) body.password = form.password;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      fetchUsers();
      setForm(emptyForm);
      setShowForm(false);
      setEditId(null);
    } else {
      alert(data.error || "Failed to save user");
    }
  }

  async function handleRoleChange(userId, newRole) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newRole }),
    });
    const data = await res.json();
    if (data.success) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } else {
      alert(data.message);
    }
  }

  function handleEdit(user) {
    setForm({ username: user.username, email: user.email || "", password: "", role: user.role });
    setEditId(user.id);
    setShowForm(true);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }); if (res.ok) fetchUsers();

    else alert("Failed to delete user");
  }

  async function handleRestore(id) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/users/${id}/restore`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) fetchUsers();
  else alert("Failed to restore user");
}


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-red-950">Users</h1>
            <p className="text-gray-500 mt-1">Manage user accounts and roles</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 bg-red-50 text-red-950 px-3 py-1.5 rounded-lg text-sm font-medium">
              <Users className="w-4 h-4" /> {users.length} users
            </span>
            <button
              onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
              className="flex items-center gap-2 bg-red-950 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-800 transition"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
        </div>

        {/* Add/Edit form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-red-950">{editId ? "Edit User" : "Add New User"}</h2>
                <button onClick={() => { setShowForm(false); setEditId(null); }}>
                  <X className="w-5 h-5 text-gray-400 hover:text-red-950" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@email.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password {editId && <span className="text-gray-400">(leave blank to keep current)</span>}
                  </label>
                  <input type="password" required={!editId} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editId ? "Leave blank to keep current" : "Set a password"}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950">
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit"
                    className="flex-1 bg-red-950 text-white py-2.5 rounded-xl font-medium hover:bg-red-800 transition">
                    {editId ? "Update User" : "Create User"}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                    className="px-5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.id} className={`transition ${user.is_active === false ? "opacity-60 bg-gray-50" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold ${user.is_active === false ? "bg-gray-400" : "bg-red-950"}`}>
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {user.username}
                          {user.is_active === false && (
                            <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Inactive</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleBadge[user.role] || "bg-gray-100 text-gray-700"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.is_active === false}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 disabled:opacity-50">
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 items-center">
                        {user.is_active !== false && (
                          <button onClick={() => handleEdit(user)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition">
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {user.is_active === false ? (
                          <button onClick={() => handleRestore(user.id)}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 transition font-medium">
                            Restore
                          </button>
                        ) : (
                          <button onClick={() => handleDelete(user.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-700 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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

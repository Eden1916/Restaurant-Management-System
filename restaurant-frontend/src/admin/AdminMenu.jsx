import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { UtensilsCrossed, Plus, Pencil, Trash2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');

function getImageUrl(image_url) {
  if (!image_url) return null;
  if (image_url.startsWith('/uploads/')) return `${API_BASE}${image_url}`;
  return image_url;
}

const emptyForm = { name: "", description: "", price: "", category_id: "", image_url: "", is_available: true };

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/menu`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/menu/categories`).then((r) => r.json()),
    ]).then(([items, cats]) => {
      setMenuItems(Array.isArray(items) ? items : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${import.meta.env.VITE_API_URL}/menu/${editId}`
      : `${import.meta.env.VITE_API_URL}/menu`;

    let res;
    if (imageFile) {
      // Send as multipart/form-data when a file is selected
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", parseFloat(form.price));
      formData.append("category_id", form.category_id);
      formData.append("is_available", form.is_available);
      formData.append("image", imageFile); // file field

      res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type — browser sets it with boundary
        body: formData,
      });
    } else {
      // Send as JSON when using image URL
      res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
      });
    }

    const data = await res.json();
    if (res.ok) {
      fetch(`${import.meta.env.VITE_API_URL}/menu`)
        .then((r) => r.json())
        .then((d) => setMenuItems(Array.isArray(d) ? d : []));
      setForm(emptyForm);
      setImageFile(null);
      setShowForm(false);
      setEditId(null);
    } else {
      alert(data.error || "Failed to save item");
    }
  }

  function handleEdit(item) {
    setForm({
      name: item.name,
      description: item.description || "",
      price: item.price,
      category_id: item.category_id,
      image_url: item.image_url || "",
      is_available: item.is_available,
    });
    setEditId(item.id);
    setShowForm(true);
    setImageFile(null);
  }

  async function handleDelete(id) {
    if (!confirm("Remove this menu item?")) return;
    await fetch(`${import.meta.env.VITE_API_URL}/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-950">Menu Management</h1>
            <p className="text-gray-500 mt-1">Add, edit, or remove menu items</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}
            className="flex items-center gap-2 bg-red-950 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-800 transition"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-red-950 mb-4">
              {editId ? "Edit Item" : "Add New Item"}
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
                <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950">
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
                  <span>OR</span>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} 
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 resize-none" />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" className="bg-red-950 text-white px-5 py-2 rounded-lg text-sm hover:bg-red-800 transition">
                  {editId ? "Update" : "Add Item"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="border border-gray-200 px-5 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Item</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Category</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Price</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center gap-3">
                      {item.image_url ? (
                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.category_name || "-"}</td>
                    <td className="px-6 py-4 text-gray-800">{item.price} ETB</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-950 transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-700 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {menuItems.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No menu items yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

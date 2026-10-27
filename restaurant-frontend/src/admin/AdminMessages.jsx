import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import DashboardLayout from "../shared/DashboardLayout";
import { Mail, RefreshCw } from "lucide-react";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL;

  async function fetchMessages() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/admin/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load messages");
      }

      setMessages(data.messages);
    } catch (err) {
      setError(err.message || "Could not load messages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  async function updateStatus(id, status) {
    setUpdatingId(id);

    try {
      const response = await fetch(`${API_URL}/admin/messages/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to update message");
      }

      setMessages((current) =>
        current.map((item) => (item.id === id ? { ...item, status } : item))
      );
      toast.success(`Message marked as ${status}`);
    } catch (err) {
      toast.error(err.message || "Could not update message");
    } finally {
      setUpdatingId(null);
    }
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-red-950">
              Customer Messages
            </h1>
            <p className="text-gray-500 mt-1">
              View and manage customer inquiries.
            </p>
          </div>

          <button
            onClick={fetchMessages}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Messages",
              value: messages.length,
            },
            {
              label: "Unread",
              value: messages.filter((m) => m.status === "unread").length,
            },
            {
              label: "Resolved",
              value: messages.filter((m) => m.status === "resolved").length,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl shadow-sm p-5"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="text-2xl font-bold text-red-950 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <p className="bg-red-50 text-red-700 rounded-lg p-4" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <Mail className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <h2 className="font-semibold text-gray-800">
              No messages yet
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Customer inquiries will appear here when submitted.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl shadow-sm p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-red-950">
                      {item.subject}
                    </h2>
                    <p className="text-sm text-gray-700 mt-1">
                      {item.name}
                    </p>
                    <a
                      href={`mailto:${item.email}`}
                      className="text-sm text-blue-700 hover:underline"
                    >
                      {item.email}
                    </a>
                  </div>

                  <span
                    className={`self-start text-xs px-3 py-1 rounded-full capitalize ${
                      item.status === "unread"
                        ? "bg-amber-100 text-amber-800"
                        : item.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mt-4">
                  {item.message}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {item.status === "unread" && (
                      <button
                        onClick={() => updateStatus(item.id, "read")}
                        disabled={updatingId === item.id}
                        className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Mark as Read
                      </button>
                    )}

                    {item.status !== "resolved" && (
                      <button
                        onClick={() => updateStatus(item.id, "resolved")}
                        disabled={updatingId === item.id}
                        className="px-3 py-2 rounded-lg bg-red-950 text-white text-sm hover:bg-red-800 disabled:opacity-50"
                      >
                        Mark Resolved
                      </button>
                    )}

                    {item.status !== "unread" && (
                      <button
                        onClick={() => updateStatus(item.id, "unread")}
                        disabled={updatingId === item.id}
                        className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        Mark Unread
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// This page handles the redirect from Google OAuth
// URL: /auth/google/success?token=...&id=...&username=...&email=...&role=...
export default function GoogleAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const role = searchParams.get("role");

    if (!token || !role) {
      navigate("/Login?error=google_failed");
      return;
    }

    // Store the same way as normal login
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({ id, username, email, role }));

    const intendedPage = localStorage.getItem("intendedPage");
    if (intendedPage) {
      localStorage.removeItem("intendedPage");
      navigate(intendedPage);
      return;
    }

    switch (role) {
      case "admin":  navigate("/admin/dashboard");   break;
      case "waiter": navigate("/waiter/dashboard");  break;
      case "chef":   navigate("/chef/dashboard");    break;
      default:       navigate("/customer/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-red-950 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Signing you in with Google...</p>
      </div>
    </div>
  );
}

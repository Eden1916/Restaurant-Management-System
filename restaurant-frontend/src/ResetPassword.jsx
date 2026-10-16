import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChefHat, Eye, EyeOff, CheckCircle } from "lucide-react";
import loginImage from "./assets/restaurant.jpg";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-bold text-gray-800">Invalid reset link</h2>
          <p className="text-gray-500 text-sm">This link is missing a token. Please request a new password reset.</p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition text-sm"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={loginImage} alt="Liyu Restaurant" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-red-950/20 flex flex-col items-center justify-center text-white p-12">
          <ChefHat className="w-16 h-16 mb-4" />
          <h1 className="text-4xl font-bold mb-3">Liyu Restaurant</h1>
          <p className="text-red-100 text-lg text-center max-w-sm">
            Authentic Ethiopian cuisine crafted with love and tradition
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center">
            <ChefHat className="w-12 h-12 text-red-950 mb-2" />
            <h1 className="text-2xl font-bold text-red-950">Liyu Restaurant</h1>
          </div>

          {done ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Password reset!</h2>
              <p className="text-gray-500 text-sm">
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate("/Login")}
                className="mt-4 w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition text-sm"
              >
                Sign In
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Set new password</h2>
                <p className="text-gray-500 mt-2">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 bg-white pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 text-sm"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400">
                <button onClick={() => navigate("/")} className="hover:text-red-950 transition">
                  ← Back to Home
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

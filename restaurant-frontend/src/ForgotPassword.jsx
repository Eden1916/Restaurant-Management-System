import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, Mail } from "lucide-react";
import loginImage from "./assets/login.jpg";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={loginImage} alt="Liyu Restaurant" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-red-950/60 flex flex-col items-center justify-center text-white p-12">
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

          {sent ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Check your email</h2>
              <p className="text-gray-500 text-sm">
                If an account exists for <span className="font-medium text-gray-700">{email}</span>,
                we've sent a password reset link. Check your inbox and spam folder.
              </p>
              <p className="text-xs text-gray-400">The link expires in 1 hour.</p>
              <button
                onClick={() => navigate("/Login")}
                className="mt-4 w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition text-sm"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Forgot password?</h2>
                <p className="text-gray-500 mt-2">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 text-sm"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/Login")}
                  className="text-red-950 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </p>

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

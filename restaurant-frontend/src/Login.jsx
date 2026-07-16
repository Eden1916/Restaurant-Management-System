import { useState } from "react"
import loginImage from "./assets/login.jpg"
import { authLogin } from "./api/auth"
import { useNavigate } from "react-router-dom"
import { ChefHat, Eye, EyeOff } from "lucide-react"

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await authLogin(email, password);
      const intendedPage = localStorage.getItem("intendedPage");

      if (intendedPage) {
        localStorage.removeItem("intendedPage");
        navigate(intendedPage);
        return;
      }

      switch (user.role) {
        case "admin": navigate("/admin/dashboard"); break;
        case "waiter": navigate("/waiter/dashboard"); break;
        case "chef": navigate("/chef/dashboard"); break;
        default: navigate("/customer/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
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

          <div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 text-sm"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/Signup")}
              className="text-red-950 font-semibold hover:underline"
            >
              Create one
            </button>
          </p>

          <p className="text-center text-sm text-gray-400">
            <button onClick={() => navigate("/")} className="hover:text-red-950 transition">
              ← Back to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

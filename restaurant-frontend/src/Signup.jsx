import sign from "./assets/restaurant.jpg"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { authSignup } from "./api/auth"
import { ChefHat, Eye, EyeOff, Check, X, User, Mail, Lock } from "lucide-react"

export default function Signup() {
  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function isValidUsername(value) {
    return /^[a-zA-Z\s]+$/.test(value)
  }

  const checks = [
    { label: "At least 6 characters", valid: password.length >= 6 },
    { label: "Contains a number",     valid: /\d/.test(password) },
    { label: "Passwords match",       valid: password === confirmPassword && confirmPassword !== "" },
  ]

  async function handleSignup(e) {
    e.preventDefault()
    setError("")
    if (password !== confirmPassword) { setError("Passwords do not match"); return }
    if (password.length < 6)          { setError("Password must be at least 6 characters"); return }
    if (!isValidUsername(username))   { setError("Username must contain only letters and spaces"); return }
    if (username.trim().length < 2)   { setError("Username must be at least 2 characters"); return }

    setLoading(true)
    try {
      const user = await authSignup({ username, email, password })
      const dest = localStorage.getItem("intendedPage")
      if (dest) { localStorage.removeItem("intendedPage"); navigate(dest); return }
      switch (user.role) {
        case "admin":  navigate("/admin/dashboard");    break
        case "waiter": navigate("/waiter/dashboard");   break
        case "chef":   navigate("/chef/dashboard");     break
        default:       navigate("/customer/dashboard")
      }
    } catch (err) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src={sign}
          alt="Liyu Restaurant"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-red-900/20 to-red-800/20" />

        {/* decorative circles */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-10 w-40 h-40 rounded-full bg-white/5" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-12">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 mb-6">
            <ChefHat className="w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold mb-4 tracking-tight">Join Liyu</h1>
          <p className="text-red-100 text-lg text-center max-w-xs leading-relaxed">
            Create an account to order online, book tables, and enjoy exclusive offers
          </p>

          <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
            {["Online ordering", "Table reservations", "Exclusive offers"].map((f) => (
              <div key={f} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-sm text-white/90">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-red-950 rounded-2xl p-3 mb-3">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-red-950">Liyu Restaurant</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/80 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-gray-900">Create account</h2>
              <p className="text-gray-500 mt-1.5 text-sm">Sign up to get started with Liyu</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    required
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setUsernameError(e.target.value && !isValidUsername(e.target.value) ? "Only letters and spaces allowed" : "")
                    }}
                    placeholder="Your full name"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 focus:border-transparent bg-gray-50 transition"
                  />
                </div>
                {usernameError && <p className="text-xs text-red-600 mt-1">{usernameError}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 focus:border-transparent bg-gray-50 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 focus:border-transparent bg-gray-50 transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 focus:border-transparent bg-gray-50 transition"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {password && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                  {checks.map((c) => (
                    <div key={c.label} className={`flex items-center gap-2 text-xs ${c.valid ? "text-green-600" : "text-gray-400"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${c.valid ? "bg-green-100" : "bg-gray-100"}`}>
                        {c.valid
                          ? <Check className="w-2.5 h-2.5 text-green-600" />
                          : <X className="w-2.5 h-2.5 text-gray-400" />}
                      </div>
                      {c.label}
                    </div>
                  ))}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 active:scale-[0.98] transition-all disabled:opacity-60 text-sm mt-1"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : "Create Account"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Google */}
            <a
              href={import.meta.env.VITE_GOOGLE_SIGN_IN}
              className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button onClick={() => navigate("/Login")} className="text-red-950 font-semibold hover:underline">
                Sign in
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400 mt-5">
            <button onClick={() => navigate("/")} className="hover:text-red-950 transition">
              ← Back to Home
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

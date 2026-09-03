import sign from "./assets/sign.jpg"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { authSignup } from "./api/auth"
import { ChefHat, Eye, EyeOff, Check } from "lucide-react"

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
    return /^[a-zA-Z\s]+$/.test(value);
  }

  // Password strength checks
  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains a number", valid: /\d/.test(password) },
    { label: "Passwords match", valid: password === confirmPassword && confirmPassword !== "" },
  ]

  async function handleSignup(e) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    if(!isValidUsername(username)) {
      setError("Username must contain only letters and spaces")
      return;
    }
    if(username.trim().length < 2){
      setError("Username must be at least 2 charachters")
      return;
    }

    setLoading(true)
    try {
      const user = await authSignup({ username, email, password })

      const dest = localStorage.getItem("intendedPage")
      if (dest) {
        localStorage.removeItem("intendedPage")
        navigate(dest)
        return
      }

      switch (user.role) {
        case "admin": navigate("/admin/dashboard"); break
        case "waiter": navigate("/waiter/dashboard"); break
        case "chef": navigate("/chef/dashboard"); break
        default: navigate("/customer/dashboard")
      }
    } catch (err) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={sign} alt="Liyu Restaurant" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-red-950/60 flex flex-col items-center justify-center text-white p-12">
          <ChefHat className="w-16 h-16 mb-4" />
          <h1 className="text-4xl font-bold mb-3">Join Liyu</h1>
          <p className="text-red-100 text-lg text-center max-w-sm">
            Create an account to order online, book tables, and enjoy exclusive offers
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center">
            <ChefHat className="w-12 h-12 text-red-950 mb-2" />
            <h1 className="text-2xl font-bold text-red-950">Liyu Restaurant</h1>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-gray-800">Create account</h2>
            <p className="text-gray-500 mt-2">Sign up to get started with Liyu</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                required
                value={username}
                onChange={(e) => { setUsername(e.target.value)
                  if(e.target.value && !isValidUsername(e.target.value)) {
                    setUsernameError("Only letters and spaces allowed")
                  } else {
                    setUsernameError("")
                  }
                }
              }
                placeholder="e.g. abebe_kebede"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-950 bg-white"
              />
              {usernameError && (
               <p className="text-xs text-red-600 mt-1">{usernameError}</p>
               )}

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Password checks */}
            {password && (
              <div className="space-y-1">
                {checks.map((c) => (
                  <div key={c.label} className={`flex items-center gap-2 text-xs ${c.valid ? "text-green-600" : "text-gray-400"}`}>
                    <Check className={`w-3.5 h-3.5 ${c.valid ? "text-green-600" : "text-gray-300"}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-950 text-white py-3 rounded-xl font-semibold hover:bg-red-800 transition disabled:opacity-60 text-sm"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
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
        </div>
      </div>
    </div>
  )
}

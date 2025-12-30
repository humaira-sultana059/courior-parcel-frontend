"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiCall } from "../../../utils/api"

export default function Login() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await apiCall("POST", "/auth/login", formData)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      const roleRoutes = {
        customer: "/customer/dashboard",
        agent: "/agent/dashboard",
        admin: "/admin/dashboard",
      }
      router.push(roleRoutes[response.user.role] || "/customer/dashboard")
    } catch (err) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center px-6 relative overflow-hidden bg-transparent">
      {/* Dynamic background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px]"></div>
      </div>

      <div className="card w-full max-w-md relative z-10 border-gray-800/80 backdrop-blur-2xl">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            Secure Access
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Welcome Back</h1>
          <p className="text-[#94a3b8] text-sm">Enter your credentials to access CourierHub</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="input-field"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider">Password</label>
              <Link href="#" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-base font-bold" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Verifying...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-[#94a3b8]">
            New to our platform?{" "}
            <Link href="/auth/register" className="font-bold text-purple-400 hover:text-purple-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

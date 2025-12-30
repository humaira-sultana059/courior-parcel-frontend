"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { apiCall } from "../../../utils/api"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    address: "",
    city: "",
    zipCode: "",
  })
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
      const response = await apiCall("POST", "/auth/register", formData)
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      const roleRoutes = {
        customer: "/customer/dashboard",
        agent: "/agent/dashboard",
        admin: "/admin/dashboard",
      }
      router.push(roleRoutes[response.user.role] || "/customer/dashboard")
    } catch (err) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center px-6 py-12 relative overflow-hidden bg-transparent">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="card w-full max-w-xl relative z-10 border-gray-800/80 backdrop-blur-2xl">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-4">
            Join the Network
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Create Account</h1>
          <p className="text-[#94a3b8] text-sm">Fill in your details to start your journey with CourierHub</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="input-field"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                Account Role
              </label>
              <select name="role" value={formData.role} onChange={handleChange} className="input-field appearance-none">
                <option value="customer" className="bg-[#0f172a]">
                  Customer
                </option>
                <option value="agent" className="bg-[#0f172a]">
                  Delivery Agent
                </option>
                <option value="admin" className="bg-[#0f172a]">
                  System Admin
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">Home Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Modern Street"
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Neo City"
                className="input-field"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="10001"
                className="input-field"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
              Security Password
            </label>
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

          <button type="submit" className="btn-secondary w-full py-4 text-base font-bold mt-4" disabled={loading}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-[#94a3b8]">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

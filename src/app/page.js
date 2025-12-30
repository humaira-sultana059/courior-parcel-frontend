import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Navigation */}
      <nav className="bg-[#0f172a]/80 border-b border-gray-800/50 px-6 py-5 sticky top-0 z-50 backdrop-blur-lg">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            CourierHub
          </div>
          <div className="flex gap-6">
            <Link href="/auth/login" className="btn-secondary text-sm">
              Login
            </Link>
            <Link href="/auth/register" className="btn-primary text-sm">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-24 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="text-center max-w-3xl relative z-10">
          <h1 className="text-6xl md:text-7xl font-black mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-200 to-purple-300">
            Track Your Parcels <br /> Anytime, Anywhere
          </h1>
          <p className="text-lg md:text-xl text-[#94a3b8] mb-10 leading-relaxed max-w-2xl mx-auto">
            Experience the future of logistics with our fast, reliable courier management system. Real-time tracking
            meets seamless delivery.
          </p>
          <div className="flex gap-6 justify-center">
            <Link href="/auth/register" className="btn-primary text-lg">
              Get Started
            </Link>
            <Link href="/auth/login" className="btn-secondary text-lg">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 w-full max-w-6xl">
          {[
            {
              title: "Real-time Tracking",
              desc: "Monitor your parcel's journey live on an interactive map with precise location updates.",
              icon: "📍",
            },
            {
              title: "Enterprise Roles",
              desc: "Dedicated interfaces for Customers, Agents, and Administrators with role-specific tools.",
              icon: "👥",
            },
            {
              title: "Instant Payments",
              desc: "Secure checkout experience with COD and prepaid options powered by advanced encryption.",
              icon: "💳",
            },
          ].map((feature, idx) => (
            <div key={idx} className="card group hover:-translate-y-2">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-[#94a3b8] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f172a] border-t border-gray-800/50 text-center py-10 text-[#94a3b8]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="font-medium">&copy; 2025 CourierHub. Designed for the next generation of logistics.</p>
        </div>
      </footer>
    </div>
  )
}

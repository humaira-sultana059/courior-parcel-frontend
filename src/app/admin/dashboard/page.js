"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AdminSidebar from "@/components/common/AdminSidebar";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "admin") {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchMetrics();
  }, [router]);

  const fetchMetrics = async () => {
    try {
      const response = await apiCall("GET", "/admin/metrics");
      setMetrics(response);

      const parcelsRes = await apiCall("GET", "/admin/parcels");
      const unassigned = parcelsRes.parcels.filter((p) => !p.agentId).length;
      setUnassignedCount(unassigned);
    } catch (err) {
      console.error("Error fetching metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  const metricCards = [
    {
      label: "Daily Bookings",
      value: metrics?.dailyBookings || 0,
      gradient: "from-blue-600/10 to-blue-600/5",
      borderColor: "border-blue-500/20",
      iconColor: "text-blue-400",
      icon: "📦",
    },
    {
      label: "Failed Deliveries",
      value: metrics?.failedDeliveries || 0,
      gradient: "from-red-600/10 to-red-600/5",
      borderColor: "border-red-500/20",
      iconColor: "text-red-400",
      icon: "❌",
    },
    {
      label: "Total Parcels",
      value: metrics?.totalParcels || 0,
      gradient: "from-emerald-600/10 to-emerald-600/5",
      borderColor: "border-emerald-500/20",
      iconColor: "text-emerald-400",
      icon: "📊",
    },
    {
      label: "Delivery Rate",
      value: `${metrics?.deliveryRate || 0}%`,
      gradient: "from-purple-600/10 to-purple-600/5",
      borderColor: "border-purple-500/20",
      iconColor: "text-purple-400",
      icon: "📈",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation user={user} />
      <AdminSidebar />

      <div className="lg:pl-68 container mx-auto px-10 py-12">
        <div className="flex justify-between max-md:flex-wrap items-end mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                Admin Control Center
              </span>
            </div>
            <h1 className="text-5xl max-md:text-2xl max-md:mb-10 font-black text-white tracking-tighter">
              System Overview
            </h1>
          </div>

          {unassignedCount > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 px-6 py-3 rounded-2xl flex items-center gap-4 animate-pulse">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                  Unassigned Tasks
                </p>
                <p className="text-xl font-black text-white">
                  {unassignedCount}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className={`card bg-gradient-to-br ${metric.gradient} ${metric.borderColor} hover:-translate-y-1`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-4">
                    {metric.label}
                  </p>
                  <p className="text-4xl font-black text-white">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={`text-3xl ${metric.iconColor} p-3 bg-white/5 rounded-2xl shadow-inner shadow-black/10`}
                >
                  {metric.icon}
                </div>
              </div>
              <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-current ${metric.iconColor}`}
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Management Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: "Parcel Ledger",
              desc: "Complete audit trail of all active and historical shipments.",
              href: "/admin/parcels",
              accent: "border-blue-500",
              glow: "shadow-blue-500/10",
              icon: "📦",
            },
            {
              title: "User Directory",
              desc: "Manage permissions and profiles for customers and staff.",
              href: "/admin/users",
              accent: "border-emerald-500",
              glow: "shadow-emerald-500/10",
              icon: "👥",
            },
            {
              title: "Strategic Reports",
              desc: "Deep-dive analytics and system performance metrics.",
              href: "/admin/reports",
              accent: "border-purple-500",
              glow: "shadow-purple-500/10",
              icon: "📊",
            },
            {
              title: "Agent Deployment",
              desc: "Real-time dispatch and shipment-to-agent pairing.",
              href: "/admin/assign-agent",
              accent: "border-amber-500",
              glow: "shadow-amber-500/10",
              icon: "👤",
            },
            // {
            //   title: "System Logs",
            //   desc: "Low-level system activity and error tracking.",
            //   href: "/admin/analytics",
            //   accent: "border-pink-500",
            //   glow: "shadow-pink-500/10",
            //   icon: "⚙️",
            // },
            // {
            //   title: "Global Config",
            //   desc: "Modify system parameters and operational settings.",
            //   href: "/admin/settings",
            //   accent: "border-indigo-500",
            //   glow: "shadow-indigo-500/10",
            //   icon: "🔧",
            // },
          ].map((item) => (
            <Link key={item.title} href={item.href}>
              <div
                className={`card group  bg-[#1e293b]/20 backdrop-blur-xl hover:bg-[#1e293b]/40 border-l-4 ${item.accent} ${item.glow}`}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-6 flex items-center text-[10px] font-bold text-[#64748b] group-hover:text-white transition-colors uppercase tracking-[0.2em]">
                  Access Module →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

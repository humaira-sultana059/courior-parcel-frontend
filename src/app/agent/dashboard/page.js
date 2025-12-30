"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AgentSidebar from "@/components/common/AgentSidebar";
import { useSocket } from "@/hooks/useSocket";

export default function AgentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    assigned: 0,
    picked: 0,
    inTransit: 0,
    completed: 0,
  });
  const socket = useSocket();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "agent") {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchAssignedParcels();
  }, [router]);

  useEffect(() => {
    const newStats = {
      assigned: parcels.filter((p) => p.status === "pending").length,
      picked: parcels.filter((p) => p.status === "picked-up").length,
      inTransit: parcels.filter((p) => p.status === "in-transit").length,
      completed: parcels.filter((p) => p.status === "delivered").length,
    };
    setStats(newStats);
  }, [parcels]);

  const fetchAssignedParcels = async () => {
    try {
      const response = await apiCall("GET", "/agents/assigned");
      setParcels(response.parcels);
    } catch (err) {
      console.error("Error fetching parcels:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const statCards = [
    {
      label: "Pending Dispatch",
      value: stats.assigned,
      accent: "text-blue-400",
      bg: "bg-blue-500/5",
      border: "border-blue-500/20",
    },
    {
      label: "Collection Complete",
      value: stats.picked,
      accent: "text-amber-400",
      bg: "bg-amber-500/5",
      border: "border-amber-500/20",
    },
    {
      label: "Active Delivery",
      value: stats.inTransit,
      accent: "text-purple-400",
      bg: "bg-purple-500/5",
      border: "border-purple-500/20",
    },
    {
      label: "Fulfilled",
      value: stats.completed,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation user={user} />
      <AgentSidebar />

      <div className="lg:pl-68 container mx-auto px-10 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              Courier Console
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            My Dispatch Room
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className={`card ${stat.bg} ${stat.border} border hover:border-white/10 transition-all`}
            >
              <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-4">
                {stat.label}
              </p>
              <p className={`text-4xl font-black ${stat.accent}`}>
                {stat.value}
              </p>
              <div className="mt-6 flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-white/5 border border-white/10"
                    ></div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-[#64748b]">
                  UNIT: VOL-0{stat.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Parcels Section */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            Active Assignments
            <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
              {parcels.length}
            </span>
          </h2>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-xs">
              🔍
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center text-xs">
              ⚡
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <p className="text-[#64748b] font-bold text-sm uppercase tracking-widest">
              Awaiting Dispatch Data...
            </p>
          </div>
        ) : parcels.length === 0 ? (
          <div className="card text-center py-20 border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl">
            <p className="text-[#64748b] font-bold text-lg uppercase tracking-widest">
              No Active Assignments
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {parcels.map((parcel) => (
              <Link key={parcel._id} href={`/agent/parcel/${parcel._id}`}>
                <div className="card group border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl hover:bg-[#1e293b]/40 hover:-translate-y-1 active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-widest">
                          # {parcel.trackingNumber}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white tracking-tight capitalize">
                        {parcel.parcelType.replace("-", " ")}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-inner shadow-black/10 ${
                        parcel.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : parcel.status === "in-transit"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      }`}
                    >
                      {parcel.status.replace("-", " ")}
                    </span>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full border border-blue-400 bg-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.3)]"></div>
                      <div className="absolute left-1 top-4 w-px h-6 bg-gray-800"></div>
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">
                        From
                      </p>
                      <p className="text-sm font-bold text-[#f8fafc]">
                        {parcel.pickupCity}
                      </p>
                    </div>

                    <div className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full border border-purple-400 bg-purple-500/20 shadow-[0_0_8px_rgba(168,85,247,0.3)]"></div>
                      <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider mb-1">
                        To
                      </p>
                      <p className="text-sm font-bold text-[#f8fafc]">
                        {parcel.deliveryCity}
                      </p>
                    </div>
                  </div>

                  <button className="w-full bg-[#1e293b] hover:bg-purple-500/10 border border-gray-700/50 hover:border-purple-500/30 text-[#94a3b8] hover:text-purple-400 font-bold text-xs py-3.5 rounded-xl transition-all duration-300 uppercase tracking-widest shadow-inner shadow-black/10">
                    Operation Details
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

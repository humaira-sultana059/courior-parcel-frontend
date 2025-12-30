"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navigation({ user }) {
  const router = useRouter();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutAlert(false);
    router.push("/auth/login");
  };

  const dashboardLinks = {
    customer: "/customer/dashboard",
    agent: "/agent/dashboard",
    admin: "/admin/dashboard",
  };

  return (
    <>
      <nav className="bg-[#0f172a]/80 border-b border-gray-800/50 px-4 lg:px-6 py-4 sticky top-0 z-50 backdrop-blur-lg shadow-xl shadow-black/20">
        <div className="flex justify-between items-center max-w-[1600px] mx-auto">
          {/* Logo - Adjusted for mobile */}
          <Link
            href={dashboardLinks[user?.role] || "/"}
            className="text-[15px] max-lg:ml-14 lg:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 hover:opacity-80 transition-all"
          >
            CourierHub
          </Link>

          {/* Desktop User Info & Logout Button */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="text-sm font-medium text-[#94a3b8] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              {user?.name}{" "}
              <span className="text-purple-400 font-bold uppercase text-[10px] tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {user?.role}
              </span>
            </div>
            <button
              onClick={() => setShowLogoutAlert(true)}
              className="px-5 py-2 rounded-xl bg-[#1e293b] border border-gray-700/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-[#f8fafc] text-sm font-semibold transition-all duration-300 shadow-inner shadow-black/10 active:scale-95"
            >
              Logout
            </button>
          </div>

          {/* Mobile Logout Icon Button */}
          <div className="lg:hidden flex items-center gap-4">
            {/* Mobile User Info (truncated) */}
            <div className="flex items-center gap-2 max-w-[150px]">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse flex-shrink-0"></span>
              <span className="text-sm font-medium text-[#94a3b8] truncate">
                {user?.name}
              </span>
              <span className="text-purple-400 font-bold uppercase text-[10px] tracking-widest bg-purple-500/10 px-1.5 py-0.5 rounded-full border border-purple-500/20 flex-shrink-0">
                {user?.role?.charAt(0)}
              </span>
            </div>

            {/* Logout Icon Button */}
            <button
              onClick={() => setShowLogoutAlert(true)}
              className="p-2.5 rounded-xl bg-[#1e293b] border border-gray-700/50 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 text-[#f8fafc] transition-all duration-300 shadow-inner shadow-black/10 active:scale-95"
              aria-label="Logout"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {showLogoutAlert && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-black/50 max-w-sm w-full animate-in zoom-in-95 duration-200 mx-4">
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2">
              Confirm Logout
            </h3>
            <p className="text-[#94a3b8] mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">
              Are you sure you want to exit? You will need to sign back in to
              access your dashboard.
            </p>
            <div className="grid grid-cols-2 gap-3 lg:gap-4">
              <button
                onClick={() => setShowLogoutAlert(false)}
                className="px-4 py-3 rounded-xl bg-[#1e293b] hover:bg-gray-800 text-[#94a3b8] text-sm font-bold transition-all shadow-inner shadow-black/20"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-3 rounded-xl bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold transition-all shadow-lg shadow-red-500/20"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

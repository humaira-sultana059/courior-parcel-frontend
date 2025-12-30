"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/customer/dashboard", icon: "📊" },
    { label: "Book Parcel", href: "/customer/book-parcel", icon: "📮" },
    // { label: "Track Parcel", href: "/customer/tracking", icon: "🔍" },
    { label: "History", href: "/customer/history", icon: "📋" },
  ];

  const isActive = (href) => pathname === href;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Only visible on small screens */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#0a192f]/90 backdrop-blur-md rounded-xl border border-gray-800/50 shadow-lg"
        aria-label="Toggle menu"
      >
        <div className="space-y-1.5 w-6">
          <span
            className={`block h-0.5 bg-gray-300 transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 bg-gray-300 transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block h-0.5 bg-gray-300 transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          ></span>
        </div>
      </button>

      {/* Overlay - Only visible when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        w-64 bg-[#0a192f]/90 border-r border-gray-800/50 min-h-screen 
        fixed left-0 top-0 pt-24 backdrop-blur-md z-40
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 opacity-50"></div>

        {/* Close button for mobile - visible only on small screens */}
        <button
          onClick={closeMobileMenu}
          className="lg:hidden absolute top-6 right-4 p-2 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <nav className="p-4 space-y-1.5">
          <div className="px-4 mb-6 text-[10px] font-bold text-[#64748b] uppercase tracking-[0.2em]">
            Customer Hub
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu} // Close menu when clicking a link on mobile
            >
              <div
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive(item.href)
                    ? "bg-[#1e293b] text-blue-400 shadow-inner shadow-black/20 border-l-4 border-blue-500"
                    : "text-[#94a3b8] hover:bg-[#1e293b]/50 hover:text-[#f8fafc]"
                }`}
              >
                <span
                  className={`text-xl transition-transform duration-300 ${
                    isActive(item.href) ? "scale-110" : "group-hover:scale-110"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">
                  {item.label}
                </span>
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

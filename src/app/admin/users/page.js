"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AdminSidebar from "@/components/common/AdminSidebar";

export default function AllUsers() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchAllUsers();
  }, [router]);

  const fetchAllUsers = async () => {
    try {
      const response = await apiCall("GET", "/admin/users");
      setUsers(response.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (roleFilter === "all") return true;
    return u.role === roleFilter;
  });

  const getRoleBadge = (role) => {
    const badges = {
      customer: "bg-blue-900 text-blue-200",
      agent: "bg-green-900 text-green-200",
      admin: "bg-red-900 text-red-200",
    };
    return badges[role] || "bg-gray-700 text-gray-300";
  };

  if (!user) return null;

  const stats = {
    customers: users.filter((u) => u.role === "customer").length,
    agents: users.filter((u) => u.role === "agent").length,
    admins: users.filter((u) => u.role === "admin").length,
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      <AdminSidebar />

      <div className="lg:pl-68  container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-8">
          User Management
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Total Users",
              value: users.length,
              color: "bg-gradient-to-br from-blue-900 to-blue-800",
              shadowColor: "shadow-blue-500/20",
            },
            {
              label: "Customers",
              value: stats.customers,
              color: "bg-gradient-to-br from-green-900 to-green-800",
              shadowColor: "shadow-green-500/20",
            },
            {
              label: "Agents",
              value: stats.agents,
              color: "bg-gradient-to-br from-purple-900 to-purple-800",
              shadowColor: "shadow-purple-500/20",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-xl p-6 shadow-lg ${stat.shadowColor} hover:shadow-xl hover:${stat.shadowColor} transition-all duration-300 border border-gray-700 transform hover:scale-105`}
            >
              <p className="text-gray-300 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "customer", "agent", "admin"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                roleFilter === role
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
              }`}
            >
              {role === "all"
                ? "All Users"
                : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl text-center py-12 shadow-lg shadow-gray-800/50">
            <p className="text-gray-400 text-lg">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Name
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Email
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Phone
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Role
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    City
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-gray-700 hover:bg-gray-800/50 transition"
                  >
                    <td className="py-4 px-4 font-semibold text-white">
                      {u.name}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {u.email}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {u.phone}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {u.city || "N/A"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          u.isActive
                            ? "bg-green-900 text-green-200"
                            : "bg-red-900 text-red-200"
                        }`}
                      >
                        {u.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

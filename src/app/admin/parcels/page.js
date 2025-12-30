"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AdminSidebar from "@/components/common/AdminSidebar";

export default function AllParcels() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchAllParcels();
  }, [router]);

  const fetchAllParcels = async () => {
    try {
      const response = await apiCall("GET", "/admin/parcels");
      setParcels(response.parcels);
    } catch (err) {
      showAlert("Error fetching parcels: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const filteredParcels = parcels.filter((parcel) => {
    if (filter === "all") return true;
    return parcel.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-900 text-green-200";
      case "in-transit":
        return "bg-yellow-900 text-yellow-200";
      case "picked-up":
        return "bg-purple-900 text-purple-200";
      case "failed":
        return "bg-red-900 text-red-200";
      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      <AdminSidebar />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-8">
          All Parcels
        </h1>

        {alert && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              alert.type === "success"
                ? "bg-green-900/50 border-green-600 text-green-200"
                : "bg-red-900/50 border-red-600 text-red-200"
            } shadow-lg`}
          >
            <p className="font-medium">{alert.message}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            "all",
            "pending",
            "picked-up",
            "in-transit",
            "delivered",
            "failed",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                filter === status
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
              }`}
            >
              {status === "all"
                ? "All"
                : status.replace("-", " ").toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : filteredParcels.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl text-center py-12 shadow-lg shadow-gray-800/50">
            <p className="text-gray-400 text-lg">No parcels found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Tracking #
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Customer
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    From
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    To
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Agent
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map((parcel) => (
                  <tr
                    key={parcel._id}
                    className="border-b border-gray-700 hover:bg-gray-800/50 transition"
                  >
                    <td className="py-4 px-4 text-blue-400 font-mono text-xs">
                      {parcel.trackingNumber.slice(0, 12)}...
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-white">
                        {parcel.customerId?.name || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {parcel.customerId?.email || ""}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {parcel.pickupCity}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {parcel.deliveryCity}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span className="text-gray-300">
                        {parcel.agentId?.name || "Unassigned"}
                      </span>
                      {!parcel.agentId && (
                        <span className="ml-2 inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                          parcel.status
                        )}`}
                      >
                        {parcel.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      ৳{parcel.shippingCost}
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

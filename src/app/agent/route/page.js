"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AgentSidebar from "@/components/common/AgentSidebar";
import RouteMapComponent from "@/components/agent/RouteMapComponent";

export default function OptimizedRoute() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "agent") {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchAssignedParcels();
  }, [router]);

  const fetchAssignedParcels = async () => {
    try {
      const response = await apiCall("GET", "/agents/assigned");
      const inTransitParcels = response.parcels.filter(
        (p) => p.status === "in-transit" || p.status === "picked-up"
      );
      setParcels(inTransitParcels);
    } catch (err) {
      console.error("Error fetching parcels:", err);
      showAlert("Error loading route data", "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      <AgentSidebar />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-8">
          Optimized Delivery Route
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

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            Loading route data...
          </div>
        ) : parcels.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl text-center py-12 shadow-lg shadow-gray-800/50">
            <p className="text-gray-400 text-lg">
              No parcels to deliver today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Route List */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg shadow-purple-500/10 sticky top-28">
                <h2 className="text-xl font-semibold mb-4 text-purple-400">
                  Delivery Stops ({parcels.length})
                </h2>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {parcels.map((parcel, idx) => (
                    <div
                      key={parcel._id}
                      className="p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-lg border border-gray-600 hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-purple-500/30">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-purple-400 truncate">
                            {parcel.trackingNumber}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {parcel.deliveryCity}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {parcel.deliveryAddress &&
                              parcel.deliveryAddress.substring(0, 35)}
                            ...
                          </p>
                          <span
                            className={`inline-block text-xs font-semibold px-2 py-1 rounded mt-2 ${
                              parcel.status === "delivered"
                                ? "bg-green-900 text-green-200"
                                : parcel.status === "in-transit"
                                ? "bg-yellow-900 text-yellow-200"
                                : "bg-purple-900 text-purple-200"
                            }`}
                          >
                            {parcel.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Route Map */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg shadow-purple-500/10 h-full">
                <RouteMapComponent parcels={parcels} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

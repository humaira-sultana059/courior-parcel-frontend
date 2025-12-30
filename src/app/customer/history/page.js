"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import CustomerSidebar from "@/components/common/CustomerSidebar";

export default function ParcelHistory() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchParcels();
  }, [router]);

  const fetchParcels = async () => {
    try {
      const response = await apiCall("GET", "/parcels/my-parcels");
      setParcels(response.parcels);
    } catch (err) {
      console.error("Error fetching parcels:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredParcels = parcels.filter((parcel) => {
    if (filter === "all") return true;
    if (filter === "delivered") return parcel.status === "delivered";
    if (filter === "in-transit") return parcel.status === "in-transit";
    if (filter === "failed") return parcel.status === "failed";
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-900 text-green-200";
      case "in-transit":
        return "bg-yellow-900 text-yellow-200";
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
      <CustomerSidebar />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-8">
          Parcel History
        </h1>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", "delivered", "in-transit", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                filter === status
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {status === "all"
                ? "All Parcels"
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700 bg-gray-900/50">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Tracking #
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    From
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    To
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Type
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Cost
                  </th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParcels.map((parcel) => (
                  <tr
                    key={parcel._id}
                    className="border-b border-gray-700 hover:bg-gray-800/50 transition"
                  >
                    <td className="py-4 px-4 text-sm text-blue-400 font-mono">
                      {parcel.trackingNumber}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {parcel.pickupCity}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300">
                      {parcel.deliveryCity}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-300 capitalize">
                      {parcel.parcelType.replace("-", " ")}
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
                    <td className="py-4 px-4">
                      <Link
                        href={`/customer/tracking/${parcel._id}`}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                      >
                        Track
                      </Link>
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

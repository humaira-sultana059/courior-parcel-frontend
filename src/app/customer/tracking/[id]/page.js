"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import CustomerSidebar from "@/components/common/CustomerSidebar";
import MapComponent from "@/components/customer/MapComponent";
import QRCodeDialog from "@/components/customer/QRCodeDialog";
import { useSocket } from "@/hooks/useSocket";

export default function TrackingPage() {
  const params = useParams();
  const [parcel, setParcel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updates, setUpdates] = useState([]);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchParcel();
  }, [params.id]);

  useEffect(() => {
    if (!socket || !parcel) return;

    socket.emit("join-tracking", parcel._id);

    socket.on("location-updated", (data) => {
      setParcel((prev) => ({
        ...prev,
        currentLatitude: data.latitude,
        currentLongitude: data.longitude,
      }));
      setUpdates((prev) => [
        ...prev,
        {
          type: "location",
          time: new Date(data.timestamp).toLocaleTimeString(),
          message: `Location updated: (${data.latitude.toFixed(
            2
          )}, ${data.longitude.toFixed(2)})`,
        },
      ]);
    });

    socket.on("status-changed", (data) => {
      setParcel((prev) => ({
        ...prev,
        status: data.status,
      }));
      setUpdates((prev) => [
        ...prev,
        {
          type: "status",
          time: new Date(data.timestamp).toLocaleTimeString(),
          message: `Status changed to: ${data.status.toUpperCase()}`,
        },
      ]);
    });

    return () => {
      socket.off("location-updated");
      socket.off("status-changed");
    };
  }, [socket, parcel]);

  const fetchParcel = async () => {
    try {
      const response = await apiCall("GET", `/parcels/${params.id}`);
      setParcel(response.parcel);
    } catch (err) {
      console.error("Error fetching parcel:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  if (!parcel)
    return (
      <div className="text-center py-8 text-gray-400">Parcel not found</div>
    );

  const statuses = ["pending", "picked-up", "in-transit", "delivered"];
  const currentStatusIndex = statuses.indexOf(parcel.status);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      <CustomerSidebar />
      <QRCodeDialog
        parcelId={parcel._id}
        isOpen={isQrOpen}
        onOpenChange={setIsQrOpen}
      />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-8">
          Track Your Parcel
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
              <p className="text-gray-400 text-sm">Tracking Number</p>
              <p className="text-xl font-semibold text-blue-400 mt-2">
                {parcel.trackingNumber}
              </p>
            </div>

            <button
              onClick={() => setIsQrOpen(true)}
              className="w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm py-4 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Show QR Code</span>
              <span className="text-lg">📱</span>
            </button>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
              <p className="text-gray-400 text-sm mb-4">Progress</p>
              <div className="space-y-3">
                {statuses.map((status, idx) => (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
                        idx <= currentStatusIndex
                          ? "bg-green-600 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`transition ${
                        idx <= currentStatusIndex
                          ? "text-white font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {status.replace("-", " ").toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg space-y-4">
              <div>
                <p className="text-gray-400 text-sm">From</p>
                <p className="font-semibold text-white mt-1">
                  {parcel.pickupCity}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm">To</p>
                <p className="font-semibold text-white mt-1">
                  {parcel.deliveryCity}
                </p>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Parcel Type</p>
                <p className="font-semibold text-white capitalize mt-1">
                  {parcel.parcelType.replace("-", " ")}
                </p>
              </div>
              {parcel.weight && (
                <div className="pt-3 border-t border-gray-700">
                  <p className="text-gray-400 text-sm">Weight</p>
                  <p className="font-semibold text-white mt-1">
                    {parcel.weight} kg
                  </p>
                </div>
              )}
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Payment Method</p>
                <p className="font-semibold text-white uppercase mt-1">
                  {parcel.paymentMethod}
                </p>
              </div>
            </div>

            {updates.length > 0 && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                <p className="text-sm font-semibold text-white mb-3">
                  Recent Updates
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {updates
                    .slice()
                    .reverse()
                    .map((update, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-gray-400 border-l-2 border-green-500 pl-2 py-1"
                      >
                        <p className="text-green-400">{update.time}</p>
                        <p>{update.message}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <MapComponent parcel={parcel} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import MapComponent from "@/components/agent/AgentMapComponent";
import { useSocket } from "@/hooks/useSocket";
import AgentSidebar from "@/components/common/AgentSidebar";

export default function AgentParcelDetail() {
  const params = useParams();
  const router = useRouter();
  const [parcel, setParcel] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [failureReason, setFailureReason] = useState("");
  const socket = useSocket();

  useEffect(() => {
    fetchParcelDetails();
  }, [params.id]);

  useEffect(() => {
    if (!socket || !parcel) return;

    socket.on("status-changed", (data) => {
      if (data.parcelId === parcel._id) {
        setParcel((prev) => ({ ...prev, status: data.status }));
      }
    });

    return () => {
      socket.off("status-changed");
    };
  }, [socket, parcel]);

  const fetchParcelDetails = async () => {
    try {
      const response = await apiCall("GET", `/parcels/${params.id}`);
      setParcel(response.parcel);
    } catch (err) {
      console.error("Error fetching parcel:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await apiCall("PATCH", `/agents/${params.id}/location`, {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          // Emit socket event
          socket?.emit("location-update", {
            parcelId: parcel._id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setParcel((prev) => ({
            ...prev,
            currentLatitude: position.coords.latitude,
            currentLongitude: position.coords.longitude,
          }));

          alert("Location updated successfully");
        } catch (err) {
          alert("Error updating location: " + err.message);
        }
      },
      (error) => {
        alert("Error getting location: " + error.message);
      }
    );
  };

  const updateDeliveryStatus = async (newStatus) => {
    if (newStatus === "failed" && !failureReason) {
      alert("Please provide a failure reason");
      return;
    }

    setUpdating(true);
    try {
      await apiCall("PATCH", `/agents/${params.id}/complete`, {
        status: newStatus,
        failureReason: newStatus === "failed" ? failureReason : null,
      });

      socket?.emit("status-update", {
        parcelId: parcel._id,
        status: newStatus,
      });

      setParcel((prev) => ({ ...prev, status: newStatus }));
      setShowStatusMenu(false);
      setFailureReason("");
      alert("Status updated successfully");
    } catch (err) {
      alert("Error updating status: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!parcel) return <div className="text-center py-8">Parcel not found</div>;

  const statusFlow = ["pending", "picked-up", "in-transit", "delivered"];
  const canProgress = statusFlow.indexOf(parcel.status) < statusFlow.length - 1;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={JSON.parse(localStorage.getItem("user"))} />
      <AgentSidebar />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-400 hover:underline flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold mb-8">Parcel Details</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Info */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card">
              <p className="text-gray-400 text-sm">Tracking Number</p>
              <p className="text-lg font-semibold text-blue-400">
                {parcel.trackingNumber}
              </p>
            </div>

            <div className="card">
              <p className="text-gray-400 text-sm mb-3">Current Status</p>
              <p className="text-2xl font-bold capitalize mb-4">
                {parcel.status.replace("-", " ")}
              </p>

              {canProgress && (
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                  >
                    Update Status
                  </button>

                  {showStatusMenu && (
                    <div className=" top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded shadow-lg z-60">
                      {statusFlow
                        .slice(statusFlow.indexOf(parcel.status) + 1)
                        .map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setSelectedStatus(status);
                              if (status !== "failed") {
                                updateDeliveryStatus(status);
                              }
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition border-b border-gray-700 last:border-b-0 capitalize"
                          >
                            {status.replace("-", " ")}
                          </button>
                        ))}
                      <button
                        onClick={() => setSelectedStatus("failed")}
                        className="block w-full text-left px-4 py-2 hover:bg-red-900 transition capitalize text-red-400"
                      >
                        Mark as Failed
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedStatus === "failed" && (
                <div className="mt-3 p-3 bg-red-900 rounded">
                  <textarea
                    placeholder="Why did delivery fail?"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                    className="w-full bg-gray-800 border border-red-700 rounded px-3 py-2 text-white text-sm placeholder-gray-500"
                    rows="3"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => updateDeliveryStatus("failed")}
                      disabled={updating}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded transition text-sm"
                    >
                      {updating ? "Submitting..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus(null);
                        setFailureReason("");
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 rounded transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="card space-y-3 ">
              <div>
                <p className="text-gray-400 text-sm">Pickup Location</p>
                <p className="font-semibold">{parcel.pickupCity}</p>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Delivery Location</p>
                <p className="font-semibold">{parcel.deliveryCity}</p>
              </div>
              <div className="pt-3 border-t border-gray-700">
                <p className="text-gray-400 text-sm">Weight</p>
                <p className="font-semibold">{parcel.weight || "N/A"} kg</p>
              </div>
            </div>

            <button
              onClick={updateLocation}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
            >
              Update Current Location
            </button>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <MapComponent parcel={parcel} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AdminSidebar from "@/components/common/AdminSidebar";

export default function AssignAgent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [parcelRes, userRes] = await Promise.all([
        apiCall("GET", "/admin/parcels"),
        apiCall("GET", "/admin/users"),
      ]);

      const unassigned = parcelRes.parcels.filter((p) => !p.agentId);
      setParcels(unassigned);

      const agentsList = userRes.users.filter((u) => u.role === "agent");
      setAgents(agentsList);
    } catch (err) {
      showAlert("Error fetching data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleAssign = async () => {
    if (!selectedParcel || !selectedAgent) {
      showAlert("Please select both parcel and agent", "error");
      return;
    }

    setAssigning(true);
    try {
      await apiCall("POST", "/admin/assign-agent", {
        parcelId: selectedParcel,
        agentId: selectedAgent,
      });

      showAlert("Agent assigned successfully", "success");
      setSelectedParcel(null);
      setSelectedAgent(null);
      fetchData();
    } catch (err) {
      showAlert("Error assigning agent: " + err.message, "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveAssignment = async (parcelId) => {
    try {
      await apiCall("POST", "/admin/remove-assignment", {
        parcelId: parcelId,
      });
      showAlert("Assignment removed successfully", "success");
      fetchData();
    } catch (err) {
      showAlert("Error removing assignment: " + err.message, "error");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      <AdminSidebar />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-8">
          Assign Delivery Agent
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
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Parcels */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg shadow-blue-500/10">
                <h2 className="text-lg font-semibold mb-4 text-blue-400">
                  Unassigned Parcels ({parcels.length})
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {parcels.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      All parcels are assigned!
                    </p>
                  ) : (
                    parcels.map((parcel) => (
                      <button
                        key={parcel._id}
                        onClick={() => setSelectedParcel(parcel._id)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedParcel === parcel._id
                            ? "bg-blue-600 border border-blue-400 shadow-lg shadow-blue-500/50"
                            : "bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-blue-500"
                        }`}
                      >
                        <p className="text-sm font-semibold text-blue-400">
                          {parcel.trackingNumber}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {parcel.pickupCity} → {parcel.deliveryCity}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Agents */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg shadow-green-500/10">
                <h2 className="text-lg font-semibold mb-4 text-green-400">
                  Available Agents ({agents.length})
                </h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {agents.length === 0 ? (
                    <p className="text-gray-400 text-sm">No agents available</p>
                  ) : (
                    agents.map((agent) => (
                      <button
                        key={agent._id}
                        onClick={() => setSelectedAgent(agent._id)}
                        className={`w-full text-left p-3 rounded-lg transition ${
                          selectedAgent === agent._id
                            ? "bg-green-600 border border-green-400 shadow-lg shadow-green-500/50"
                            : "bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-green-500"
                        }`}
                      >
                        <p className="text-sm font-semibold text-green-300">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {agent.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {agent.city || "No city"}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg shadow-purple-500/10 sticky top-28">
                <h2 className="text-lg font-semibold mb-6 text-purple-400">
                  Assignment Summary
                </h2>

                {selectedParcel && (
                  <div className="mb-6 p-4 bg-blue-900/50 rounded-lg border border-blue-600">
                    <p className="text-sm text-gray-300 mb-2">
                      Selected Parcel:
                    </p>
                    <p className="font-semibold text-blue-300 mb-2">
                      {
                        parcels.find((p) => p._id === selectedParcel)
                          ?.trackingNumber
                      }
                    </p>
                    <button
                      onClick={() => setSelectedParcel(null)}
                      className="text-xs text-blue-400 hover:text-blue-200 underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                {selectedAgent && (
                  <div className="mb-6 p-4 bg-green-900/50 rounded-lg border border-green-600">
                    <p className="text-sm text-gray-300 mb-2">
                      Selected Agent:
                    </p>
                    <p className="font-semibold text-green-300 mb-2">
                      {agents.find((a) => a._id === selectedAgent)?.name}
                    </p>
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="text-xs text-green-400 hover:text-green-200 underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAssign}
                  disabled={!selectedParcel || !selectedAgent || assigning}
                  className={`w-full py-2 rounded-lg transition font-semibold shadow-lg ${
                    selectedParcel && selectedAgent
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer shadow-blue-500/30 hover:shadow-blue-500/50"
                      : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {assigning ? "Assigning..." : "Assign Agent"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

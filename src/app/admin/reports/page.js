"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import AdminSidebar from "@/components/common/AdminSidebar";

export default function Reports() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState("summary");
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser || JSON.parse(savedUser).role !== "admin") {
      router.push("/login");
      return;
    }

    setUser(JSON.parse(savedUser));
    fetchReportData();
  }, [router]);

  const fetchReportData = async () => {
    try {
      const [metricsRes, parcelsRes] = await Promise.all([
        apiCall("GET", "/admin/metrics"),
        apiCall("GET", "/admin/parcels"),
      ]);
      setMetrics(metricsRes);
      setParcels(parcelsRes.parcels);
    } catch (err) {
      showAlert("Error fetching report data: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleExportCSV = () => {
    if (parcels.length === 0) {
      showAlert("No data to export", "error");
      return;
    }

    const headers = [
      "Tracking #",
      "Customer",
      "Status",
      "From",
      "To",
      "Cost",
      "Payment",
    ];
    const rows = parcels.map((p) => [
      p.trackingNumber,
      p.customerId?.name || "N/A",
      p.status,
      p.pickupCity,
      p.deliveryCity,
      p.shippingCost,
      p.paymentMethod,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "parcels-report.csv";
    a.click();
    showAlert("Report exported successfully", "success");
  };

  if (!user || loading) return null;

  const deliveredParcels = parcels.filter((p) => p.status === "delivered");
  const failedParcels = parcels.filter((p) => p.status === "failed");
  const totalRevenue = parcels.reduce(
    (sum, p) => sum + (p.shippingCost || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation user={user} />
      <AdminSidebar />

      <div className="lg:pl-68 container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <button
            onClick={handleExportCSV}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
          >
            Export CSV
          </button>
        </div>

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

        {/* Report Type Selector */}
        <div className="flex gap-2 mb-8">
          {["summary", "parcels", "revenue"].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                reportType === type
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Summary Report */}
        {reportType === "summary" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  label: "Total Parcels",
                  value: metrics?.totalParcels,
                  color: "bg-gradient-to-br from-blue-900 to-blue-800",
                  shadowColor: "shadow-blue-500/20",
                },
                {
                  label: "Delivered",
                  value: metrics?.deliveredParcels,
                  color: "bg-gradient-to-br from-green-900 to-green-800",
                  shadowColor: "shadow-green-500/20",
                },
                {
                  label: "Failed",
                  value: metrics?.failedDeliveries,
                  color: "bg-gradient-to-br from-red-900 to-red-800",
                  shadowColor: "shadow-red-500/20",
                },
                {
                  label: "Success Rate",
                  value: `${metrics?.deliveryRate}%`,
                  color: "bg-gradient-to-br from-purple-900 to-purple-800",
                  shadowColor: "shadow-purple-500/20",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} rounded-xl p-6 shadow-lg ${item.shadowColor} hover:shadow-xl transition-all duration-300 border border-gray-700 transform hover:scale-105`}
                >
                  <p className="text-gray-300 text-sm mb-2">{item.label}</p>
                  <p className="text-4xl font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Key Metrics
              </h2>
              <div className="space-y-3 text-gray-300">
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span>Daily Bookings</span>
                  <span className="font-semibold text-blue-400">
                    {metrics?.dailyBookings}
                  </span>
                </div>
                <div className="flex justify-between pb-3 border-b border-gray-700">
                  <span>Total Revenue (৳)</span>
                  <span className="font-semibold text-green-400">
                    {totalRevenue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>COD Collected (৳)</span>
                  <span className="font-semibold text-yellow-400">
                    {metrics?.codAmount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parcels Report */}
        {reportType === "parcels" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Detailed Parcel Report
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      Tracking #
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      From
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      To
                    </th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {parcels.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-gray-700 hover:bg-gray-800/50 transition"
                    >
                      <td className="py-3 px-4 text-blue-400 text-xs font-mono">
                        {p.trackingNumber.slice(0, 15)}...
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300">
                        {p.status.toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300">
                        {p.pickupCity}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300">
                        {p.deliveryCity}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-300">
                        ৳{p.shippingCost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revenue Report */}
        {reportType === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Total Revenue",
                  value: `৳${totalRevenue}`,
                  color: "bg-gradient-to-br from-blue-900 to-blue-800",
                  shadowColor: "shadow-blue-500/20",
                },
                {
                  label: "Prepaid Orders",
                  value: parcels.filter((p) => p.paymentMethod === "prepaid")
                    .length,
                  color: "bg-gradient-to-br from-green-900 to-green-800",
                  shadowColor: "shadow-green-500/20",
                },
                {
                  label: "COD Orders",
                  value: parcels.filter((p) => p.paymentMethod === "cod")
                    .length,
                  color: "bg-gradient-to-br from-yellow-900 to-yellow-800",
                  shadowColor: "shadow-yellow-500/20",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`${item.color} rounded-xl p-6 shadow-lg ${item.shadowColor} hover:shadow-xl transition-all duration-300 border border-gray-700 transform hover:scale-105`}
                >
                  <p className="text-gray-300 text-sm mb-2">{item.label}</p>
                  <p className="text-3xl font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-white">
                Payment Method Breakdown
              </h2>
              <div className="space-y-4">
                {[
                  {
                    method: "Prepaid",
                    count: parcels.filter((p) => p.paymentMethod === "prepaid")
                      .length,
                    total: parcels
                      .filter((p) => p.paymentMethod === "prepaid")
                      .reduce((sum, p) => sum + (p.shippingCost || 0), 0),
                  },
                  {
                    method: "Cash on Delivery",
                    count: parcels.filter((p) => p.paymentMethod === "cod")
                      .length,
                    total: parcels
                      .filter((p) => p.paymentMethod === "cod")
                      .reduce((sum, p) => sum + (p.codAmount || 0), 0),
                  },
                ].map((item) => (
                  <div
                    key={item.method}
                    className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition"
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-white">
                        {item.method}
                      </span>
                      <span className="text-blue-400 text-sm">
                        {item.count} orders
                      </span>
                    </div>
                    <div className="text-lg font-bold text-green-400">
                      ৳{item.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

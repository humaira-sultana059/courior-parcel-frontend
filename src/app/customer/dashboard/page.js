"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import CustomerSidebar from "@/components/common/CustomerSidebar";
import QRCodeDialog from "@/components/customer/QRCodeDialog";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [isQrOpen, setIsQrOpen] = useState(false);

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

  const handleShowQR = (e, parcelId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedParcelId(parcelId);
    setIsQrOpen(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation user={user} />
      <CustomerSidebar />
      <QRCodeDialog
        parcelId={selectedParcelId}
        isOpen={isQrOpen}
        onOpenChange={setIsQrOpen}
      />

      <div className="lg:pl-68 container mx-auto px-10 lg:px-5 py-12 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
                Customer Terminal
              </span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              My Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link
              href="/customer/history"
              className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-[#1e293b] border border-gray-800/50 text-[#94a3b8] font-bold text-sm hover:text-[#f8fafc] hover:bg-gray-800 transition-all shadow-inner shadow-black/10 text-center"
            >
              See History
            </Link>
            <Link
              href="/customer/book-parcel"
              className="flex-1 md:flex-none px-6 py-3.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 text-center"
            >
              Book New Parcel
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-[#64748b] font-bold text-sm uppercase tracking-widest">
              Syncing Data...
            </p>
          </div>
        ) : parcels.length === 0 ? (
          <div className="card text-center py-20 border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl">
            <div className="w-20 h-20 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner shadow-black/20">
              📦
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
              No active parcels
            </h3>
            <p className="text-[#94a3b8] mb-10 max-w-sm mx-auto">
              You haven't booked any parcels yet. Start your first shipment now
              and track it in real-time.
            </p>
            <Link
              href="/customer/book-parcel"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Book Your First Parcel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {parcels.map((parcel) => (
              <Link key={parcel._id} href={`/customer/tracking/${parcel._id}`}>
                <div className="card group border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl hover:bg-[#1e293b]/40 hover:-translate-y-1 active:scale-[0.98]">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest">
                          ID: {parcel.trackingNumber}
                        </span>
                      </div>
                      <p className="text-xl font-bold text-white tracking-tight">
                        {parcel.parcelType}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] lg:max-2xl:text-[7px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-inner shadow-black/10 ${
                        parcel.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : parcel.status === "in-transit"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}
                    >
                      {parcel.status}
                    </span>
                  </div>

                  <div className="mb-6">
                    <button
                      onClick={(e) => handleShowQR(e, parcel._id)}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-blue-400 font-bold text-xs uppercase tracking-widest hover:bg-blue-500/10 hover:border-blue-500/20 transition-all"
                    >
                      <span>Show QR Code</span>
                      <span className="text-lg">📱</span>
                    </button>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-sm shadow-inner shadow-black/10">
                        📍
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                          Destination
                        </p>
                        <p className="text-sm font-bold text-[#f8fafc]">
                          {parcel.deliveryCity}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center text-sm shadow-inner shadow-black/10">
                        💰
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                          Payment
                        </p>
                        <p className="text-sm font-bold text-[#f8fafc]">
                          {parcel.paymentMethod === "cod" ? "COD" : "Prepaid"} •
                          ৳{parcel.shippingCost}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-800/50 flex items-center justify-between">
                    <span className="text-xs font-bold text-[#64748b] group-hover:text-blue-400 transition-colors">
                      Track Shipment →
                    </span>
                    <div className="w-8 h-1 rounded-full bg-gray-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width:
                            parcel.status === "delivered"
                              ? "100%"
                              : parcel.status === "in-transit"
                              ? "60%"
                              : "20%",
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

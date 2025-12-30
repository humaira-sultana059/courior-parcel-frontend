"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/utils/api";
import Navigation from "@/components/common/Navigation";
import CustomerSidebar from "@/components/common/CustomerSidebar";

export default function BookParcel() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    pickupAddress: "",
    pickupCity: "",
    deliveryAddress: "",
    deliveryCity: "",
    parcelType: "small-package",
    weight: "",
    paymentMethod: "prepaid",
    codAmount: "",
    shippingCost: 100,
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showAlert = (message, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiCall("POST", "/parcels/book", formData);
      showAlert("Parcel booked successfully", "success");
      setTimeout(() => router.push("/customer/dashboard"), 1500);
    } catch (err) {
      showAlert(err.message || "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user") || "{}"));
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <Navigation user={user} />
      <CustomerSidebar />

      <div className="lg:pl-10 container mx-auto px-10 py-12 max-w-3xl relative">
        <div className="absolute top-20 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              Shipment Booking
            </span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">
            Book a Parcel
          </h1>
        </div>

        {alert && (
          <div
            className={`mb-8 p-5 rounded-2xl border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300 ${
              alert.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            } shadow-xl shadow-black/20`}
          >
            <p className="font-bold flex items-center gap-2">
              <span className="text-xl">
                {alert.type === "success" ? "✓" : "!"}
              </span>
              {alert.message}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="card border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-2xl p-10 space-y-10"
        >
          {/* Pickup Details */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] border-l-2 border-blue-500 pl-4">
              Pickup Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  Address
                </label>
                <input
                  type="text"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleChange}
                  placeholder="Full street address"
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  City
                </label>
                <input
                  type="text"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleChange}
                  placeholder="Pickup city"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </section>

          {/* Delivery Details */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-[0.2em] border-l-2 border-purple-500 pl-4">
              Delivery Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  Address
                </label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Destination street address"
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  City
                </label>
                <input
                  type="text"
                  name="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={handleChange}
                  placeholder="Destination city"
                  className="input-field"
                  required
                />
              </div>
            </div>
          </section>

          {/* Parcel Details */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-[#94a3b8] uppercase tracking-[0.2em] border-l-2 border-gray-700 pl-4">
              Shipment Specifics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  Type
                </label>
                <select
                  name="parcelType"
                  value={formData.parcelType}
                  onChange={handleChange}
                  className="input-field appearance-none"
                >
                  <option value="document">Document</option>
                  <option value="small-package">Small Package</option>
                  <option value="medium-package">Medium Package</option>
                  <option value="large-package">Large Package</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  Weight (KG)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  Cost (৳)
                </label>
                <input
                  type="number"
                  name="shippingCost"
                  value={formData.shippingCost}
                  onChange={handleChange}
                  className="input-field bg-[#1e293b] font-bold text-blue-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                  Payment
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="input-field appearance-none"
                >
                  <option value="prepaid">Prepaid</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              {formData.paymentMethod === "cod" && (
                <div className="space-y-2 animate-in slide-in-from-left-4">
                  <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wider ml-1">
                    COD Amount (৳)
                  </label>
                  <input
                    type="number"
                    name="codAmount"
                    value={formData.codAmount}
                    onChange={handleChange}
                    placeholder="Collection amount"
                    className="input-field border-amber-500/20"
                    required
                  />
                </div>
              )}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2 text-lg font-black mt-6 uppercase"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                Processing Shipment...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

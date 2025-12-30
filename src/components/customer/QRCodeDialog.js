"use client";

import { useState, useEffect, useCallback } from "react";
import { apiCall } from "@/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function QRCodeDialog({ parcelId, isOpen, onOpenChange }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQRCode = useCallback(async () => {
    if (!parcelId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall("GET", `/parcels/${parcelId}/qr-code`);
      if (response && response.qrCode) {
        setQrCode(response.qrCode);
      }
    } catch (err) {
      console.error("[v0] QR fetch error:", err);
      setError("Failed to load QR code.");
    } finally {
      setLoading(false);
    }
  }, [parcelId]);

  useEffect(() => {
    if (isOpen && parcelId) {
      fetchQRCode();
    }
  }, [isOpen, parcelId, fetchQRCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-gray-900 p-6 shadow-lg duration-200 text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            Parcel QR Code
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Scan for confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-sm relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500 rounded-br-lg"></div>

          {loading ? (
            <Skeleton className="w-64 h-64 rounded-xl bg-gray-800" />
          ) : error ? (
            <div className="w-64 h-64 flex items-center justify-center text-center p-4 text-red-400 text-sm font-bold bg-red-500/5 rounded-xl border border-red-500/20">
              {error}
            </div>
          ) : (
            <div className="p-4 bg-white rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              <img
                src={qrCode || "/placeholder.svg"}
                alt="Parcel QR Code"
                className="w-56 h-56"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

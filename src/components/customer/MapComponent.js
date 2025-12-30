"use client";

import { useEffect, useRef } from "react";

export default function MapComponent({ parcel }) {
  const mapRef = useRef(null);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const pickup = {
      lat: parcel.pickupLatitude || 28.7041,
      lng: parcel.pickupLongitude || 77.1025,
    };
    const delivery = {
      lat: parcel.deliveryLatitude || 19.0876,
      lng: parcel.deliveryLongitude || 72.8691,
    };

    const initMap = () => {
      if (!window.google || !mapElement) return;

      const map = new window.google.maps.Map(mapElement, {
        zoom: 6,
        center: pickup,
        disableDefaultUI: true,
        styles: [{ elementType: "geometry", stylers: [{ color: "#1e293b" }] }],
      });

      new window.google.maps.Marker({
        position: pickup,
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      });
      new window.google.maps.Marker({
        position: delivery,
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      });
    };

    if (window.google) {
      initMap();
    } else {
      // Note: NEXT_PUBLIC keys are intended for client use; domain restriction is the primary security measure.
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      if (!apiKey) {
        console.warn("[v0] Google Maps API key missing.");
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [parcel]);

  return (
    <div className="card border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl p-4 rounded-2xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
          Live Tracking
        </p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl border border-gray-800/50 bg-[#0f172a]"
      />
    </div>
  );
}

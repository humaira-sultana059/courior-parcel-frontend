"use client";

import { useEffect, useRef } from "react";

export default function AgentMapComponent({ parcel }) {
  const mapRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement) return;

    const loadMap = () => {
      if (!window.google || !mapElement) return;

      const pickup = {
        lat: parcel.pickupLatitude || 28.7041,
        lng: parcel.pickupLongitude || 77.1025,
      };
      const delivery = {
        lat: parcel.deliveryLatitude || 19.0876,
        lng: parcel.deliveryLongitude || 72.8691,
      };
      const current = {
        lat: parcel.currentLatitude || pickup.lat,
        lng: parcel.currentLongitude || pickup.lng,
      };

      const map = new window.google.maps.Map(mapElement, {
        zoom: 10,
        center: current,
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
      new window.google.maps.Marker({
        position: current,
        map: map,
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
    };

    if (window.google) {
      loadMap();
    } else {
      const script = document.createElement("script");
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
      script.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey;
      script.async = true;
      script.onload = loadMap;
      scriptRef.current = script;
      document.head.appendChild(script);
    }

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [parcel]);

  return (
    <div className="card border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
          Delivery Route
        </p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[400px] rounded-xl border border-gray-800/50 bg-[#0f172a]"
      />
    </div>
  );
}

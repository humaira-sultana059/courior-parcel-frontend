"use client";

import { useEffect, useRef } from "react";

export default function RouteMapComponent({ parcels }) {
  const mapRef = useRef(null);
  const scriptRef = useRef(null);

  useEffect(() => {
    const mapElement = mapRef.current;
    if (!mapElement || !parcels || parcels.length === 0) return;

    const loadMap = () => {
      if (!window.google || !mapElement) return;

      const first = parcels[0];
      const center = {
        lat: first.pickupLatitude || 28.7041,
        lng: first.pickupLongitude || 77.1025,
      };

      const map = new window.google.maps.Map(mapElement, {
        zoom: 8,
        center: center,
        disableDefaultUI: true,
        styles: [{ elementType: "geometry", stylers: [{ color: "#1e293b" }] }],
      });

      parcels.forEach(function (p, i) {
        new window.google.maps.Marker({
          position: {
            lat: p.deliveryLatitude || 19.0876,
            lng: p.deliveryLongitude || 72.8691,
          },
          map: map,
          label: { text: String(i + 1), color: "white" },
        });
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
  }, [parcels]);

  return (
    <div className="card border-gray-800/80 bg-[#1e293b]/20 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
        <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
          Route Intelligence
        </p>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[500px] rounded-xl border border-gray-800/50 bg-[#0f172a]"
      />
    </div>
  );
}

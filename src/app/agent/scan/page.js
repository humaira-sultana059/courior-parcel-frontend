"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "../../../utils/api";
import Navigation from "../../../components/common/Navigation";
import AgentSidebar from "../../../components/common/AgentSidebar";
import { toast } from "../../../../hooks/use-toast";

// Import react-qr-scanner - check which one you installed
// If you installed 'react-qr-scanner' (not '@yudiel/react-qr-scanner'):
import QrScanner from "react-qr-scanner";
// OR if you installed '@yudiel/react-qr-scanner':
// import { QrScanner } from "@yudiel/react-qr-scanner";

export default function QRScannerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [scanning, setScanning] = useState(true);
  const [hasCamera, setHasCamera] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);

  const handleProcessScan = useCallback(
    async (trackingNumber) => {
      if (!trackingNumber) return;

      // Prevent duplicate scans within 2 seconds
      setLastResult(trackingNumber);
      setScanning(false); // Pause scanning while processing

      try {
        const response = await apiCall(
          "GET",
          `/parcels/search?trackingNumber=${encodeURIComponent(trackingNumber)}`
        );
        if (response && response.parcel) {
          router.push(`/agent/parcel/${response.parcel._id}`);
        } else {
          toast({
            title: "Scan Error",
            description: "Parcel not found.",
            variant: "destructive",
          });
          // Resume scanning after error
          setTimeout(() => setScanning(true), 2000);
        }
      } catch (err) {
        console.error("[v0] Scan processing error:", err);
        toast({
          title: "Error",
          description: "Failed to process scan.",
          variant: "destructive",
        });
        // Resume scanning after error
        setTimeout(() => setScanning(true), 2000);
      }
    },
    [router]
  );

  // Check for camera availability
  useEffect(() => {
    const checkCamera = async () => {
      try {
        if (
          !navigator.mediaDevices ||
          !navigator.mediaDevices.enumerateDevices
        ) {
          setHasCamera(false);
          setCameraError("Media devices not supported");
          return;
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some(
          (device) => device.kind === "videoinput"
        );
        setHasCamera(hasVideoInput);

        if (!hasVideoInput) {
          setCameraError("No camera found on this device");
        }
      } catch (error) {
        console.error("Error checking camera:", error);
        setHasCamera(false);
        setCameraError("Failed to access camera");
      }
    };

    checkCamera();
  }, []);

  // Handle user authentication
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/auth/login");
      return;
    }

    const userData = JSON.parse(savedUser);
    if (userData.role !== "agent") {
      router.push("/auth/login");
      return;
    }

    setUser(userData);
  }, [router]);

  // Handle scan result
  const handleScan = useCallback(
    (result) => {
      if (result && scanning) {
        handleProcessScan(result?.text);
      }
    },
    [scanning, handleProcessScan]
  );

  // Handle scan error
  const handleError = useCallback((error) => {
    console.error("[QR Scanner Error]", error);
    setCameraError(error?.message || "Camera error");

    if (error?.name === "NotAllowedError") {
      toast({
        title: "Camera Permission Denied",
        description: "Please allow camera access to use the scanner.",
        variant: "destructive",
      });
    } else if (error?.name === "NotFoundError") {
      toast({
        title: "No Camera Found",
        description: "No camera device found on your system.",
        variant: "destructive",
      });
      setHasCamera(false);
    } else if (error?.name === "NotReadableError") {
      toast({
        title: "Camera In Use",
        description: "Camera is already in use by another application.",
        variant: "destructive",
      });
    }
  }, []);

  const toggleScanning = useCallback(() => {
    setScanning(!scanning);
  }, [scanning]);

  const handleRescan = useCallback(() => {
    setScanning(true);
    setLastResult(null);
  }, []);

  const requestCameraAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamera(true);
      setCameraError(null);
      // Stop the stream immediately since react-qr-scanner will start its own
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Failed to get camera access:", error);
      handleError(error);
    }
  }, [handleError]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-transparent text-white">
      <Navigation user={user} />
      <AgentSidebar />

      <div className="lg:pl-68 container mx-auto px-10 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
            <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">
              Terminal Scanner
            </span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">
            QR Operations
          </h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="card border-purple-500/20 bg-[#1e293b]/40 backdrop-blur-xl p-8 relative overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.8)]"></div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-2">Ready to Scan</h2>
              <p className="text-gray-400 text-sm">
                Align the QR code within the frame.
              </p>

              {cameraError && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-300 font-medium mb-2">
                    Camera Error: {cameraError}
                  </p>
                  <button
                    onClick={requestCameraAccess}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                  >
                    Request Camera Access
                  </button>
                </div>
              )}
            </div>

            {/* QR Scanner Container */}
            <div className="rounded-2xl overflow-hidden border-2 border-dashed border-gray-700 bg-black/20 relative min-h-[400px]">
              {hasCamera ? (
                <div className="relative w-full h-full">
                  {/* Scanner overlay with corner design */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    {/* Corner borders */}
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-4 border-l-4 border-purple-500 rounded-tl-xl"></div>
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-4 border-r-4 border-purple-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-4 border-l-4 border-purple-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-4 border-r-4 border-purple-500 rounded-br-xl"></div>

                    {/* Center guide */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-white/30 rounded-xl"></div>

                    {/* Scanning animation */}
                    {scanning && (
                      <>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-1 bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-scan-vertical"></div>
                      </>
                    )}
                  </div>

                  {/* QR Scanner component - FULL SCREEN */}
                  <div className="w-full h-full">
                    <QrScanner
                      delay={scanning ? 300 : 10000}
                      onError={handleError}
                      onScan={handleScan}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "1rem",
                      }}
                      constraints={{
                        facingMode: "environment",
                        aspectRatio: 1,
                      }}
                    />
                  </div>

                  {/* Scanner status overlay */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          scanning
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-sm font-bold">
                        {scanning ? "SCANNING..." : "PAUSED"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8">
                  <div className="w-20 h-20 mb-6 bg-gray-800/50 rounded-full flex items-center justify-center border-2 border-gray-700">
                    <svg
                      className="w-10 h-10 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-center mb-6">
                    Camera not available. Please connect a camera to use the
                    scanner.
                  </p>
                  <button
                    onClick={requestCameraAccess}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button
                onClick={toggleScanning}
                className={`px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 ${
                  scanning
                    ? "bg-yellow-600 hover:bg-yellow-700 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {scanning ? (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      PAUSE SCANNER
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      RESUME SCANNING
                    </>
                  )}
                </div>
              </button>

              <button
                onClick={handleRescan}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  CLEAR & RESCAN
                </div>
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-2">
                  Scanner Status
                </p>
                <p
                  className={`font-bold flex items-center gap-3 text-lg ${
                    scanning ? "text-emerald-400" : "text-yellow-400"
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${
                      scanning
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-yellow-500"
                    }`}
                  ></span>
                  {scanning ? "ACTIVE" : "PAUSED"}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm">
                <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest mb-2">
                  Last Scan Result
                </p>
                <div className="font-bold truncate text-lg">
                  {lastResult ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="truncate">{lastResult}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Awaiting scan...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 p-5 bg-black/30 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <svg
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-bold text-gray-300">
                  Scanner Tips & Instructions
                </p>
              </div>
              <ul className="text-sm text-gray-400 space-y-2 pl-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>
                    Ensure good lighting conditions for optimal scanning
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Hold the QR code steady within the center frame</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Maintain a distance of 15-30cm from the camera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>
                    Use back camera on mobile devices for better results
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>Pause scanner when not in use to conserve battery</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes scan {
          0%,
          100% {
            opacity: 0.3;
            transform: translateX(-50%) translateY(-50%) scaleX(0.8);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(-50%) scaleX(1);
          }
        }

        @keyframes scan-vertical {
          0%,
          100% {
            opacity: 0.3;
            transform: translateX(-50%) translateY(-50%) scaleY(0.8);
          }
          50% {
            opacity: 1;
            transform: translateX(-50%) translateY(-50%) scaleY(1);
          }
        }

        .animate-scan {
          animation: scan 2s ease-in-out infinite;
        }

        .animate-scan-vertical {
          animation: scan-vertical 2s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

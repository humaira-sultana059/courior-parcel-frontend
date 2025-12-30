"use client"

import { useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"

export const useSocket = () => {
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null)

  useEffect(() => {
    // Prevent multiple socket connections
    if (socketRef.current) {
      return
    }

    const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user") || "{}")

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
      // Notify server of user login
      if (user.id) {
        newSocket.emit("user-login", user.id)
      }
    })

    newSocket.on("connection-confirmed", (data) => {
      console.log("Connection confirmed:", data.socketId)
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
    })

    newSocket.on("system-announcement", (data) => {
      console.log("System announcement:", data)
    })

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    return () => {
      // Don't close on unmount, keep connection alive
      // newSocket.close()
    }
  }, [])

  return socket
}

export const useParcelTracking = (parcelId, socket) => {
  const [trackingData, setTrackingData] = useState({
    parcelId,
    status: null,
    location: null,
    updates: [],
  })

  useEffect(() => {
    if (!socket || !parcelId) return

    socket.emit("join-tracking", parcelId)

    const handleLocationUpdate = (data) => {
      if (data.parcelId === parcelId) {
        setTrackingData((prev) => ({
          ...prev,
          location: { latitude: data.latitude, longitude: data.longitude },
          updates: [
            ...prev.updates,
            {
              type: "location",
              time: new Date(data.timestamp),
              message: `Location updated: (${data.latitude.toFixed(2)}, ${data.longitude.toFixed(2)})`,
            },
          ],
        }))
      }
    }

    const handleStatusChange = (data) => {
      if (data.parcelId === parcelId) {
        setTrackingData((prev) => ({
          ...prev,
          status: data.status,
          updates: [
            ...prev.updates,
            {
              type: "status",
              time: new Date(data.timestamp),
              message: `Status changed to: ${data.status.toUpperCase()}`,
            },
          ],
        }))
      }
    }

    const handleDeliveryFinished = (data) => {
      if (data.parcelId === parcelId) {
        setTrackingData((prev) => ({
          ...prev,
          status: data.status,
          updates: [
            ...prev.updates,
            {
              type: "delivery",
              time: new Date(data.completedAt),
              message: `Delivery completed!`,
            },
          ],
        }))
      }
    }

    socket.on("location-updated", handleLocationUpdate)
    socket.on("status-changed", handleStatusChange)
    socket.on("delivery-finished", handleDeliveryFinished)

    return () => {
      socket.off("location-updated", handleLocationUpdate)
      socket.off("status-changed", handleStatusChange)
      socket.off("delivery-finished", handleDeliveryFinished)
      socket.emit("leave-tracking", parcelId)
    }
  }, [socket, parcelId])

  return trackingData
}

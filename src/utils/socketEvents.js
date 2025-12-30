// Central place to manage all Socket.IO event handlers

export const socketEventHandlers = {
  // Customer events
  trackingJoined: (socket, parcelId) => {
    socket.emit("join-tracking", parcelId)
  },

  trackingLeft: (socket, parcelId) => {
    socket.emit("leave-tracking", parcelId)
  },

  // Agent events
  updateLocation: (socket, parcelId, latitude, longitude, agentId) => {
    socket.emit("location-update", {
      parcelId,
      latitude,
      longitude,
      agentId,
    })
  },

  updateStatus: (socket, parcelId, status, previousStatus, agentId) => {
    socket.emit("status-update", {
      parcelId,
      status,
      previousStatus,
      agentId,
    })
  },

  deliveryCompleted: (socket, parcelId, status) => {
    socket.emit("delivery-completed", {
      parcelId,
      status,
    })
  },

  // Admin events
  broadcastAnnouncement: (socket, message, priority = "info") => {
    socket.emit("broadcast-announcement", {
      message,
      priority,
    })
  },

  parcelBooked: (socket, parcel) => {
    socket.emit("parcel-booked", {
      parcelId: parcel._id,
      trackingNumber: parcel.trackingNumber,
      pickupCity: parcel.pickupCity,
      deliveryCity: parcel.deliveryCity,
    })
  },

  agentAssigned: (socket, parcelId, agentId, agentName, pickupCity, deliveryCity) => {
    socket.emit("agent-assigned", {
      parcelId,
      agentId,
      agentName,
      pickupCity,
      deliveryCity,
    })
  },
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

const SOCKET_URL = 'http://localhost:5000'; // Change to your backend URL

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [authData, setAuthData] = useState({ user: null, token: null });

  // Initialize socket connection when auth data is available
  useEffect(() => {
    if (authData.token && authData.user) {
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: authData.token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        
        // Emit driver online event
        newSocket.emit('driver-online', {
          driverId: authData.user?.id,
          location: driverLocation || { latitude: 0, longitude: 0 }
        });
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('new-ride-request', (data) => {
        console.log('New ride request:', data);
        setRideRequest(data);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.emit('driver-offline', { driverId: authData.user?.id });
          newSocket.close();
        }
      };
    }
  }, [authData.token, authData.user]);

  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  const value = {
    socket,
    isConnected,
    rideRequest,
    setRideRequest,
    driverLocation,
    setDriverLocation,
    emitEvent,
    setAuthData,
    goOnline: (location) => {
      setDriverLocation(location);
      emitEvent('driver-online', { driverId: authData.user?.id, location });
    },
    goOffline: () => {
      emitEvent('driver-offline', { driverId: authData.user?.id });
    },
    updateLocation: (location) => {
      setDriverLocation(location);
      emitEvent('update-location', {
        driverId: authData.user?.id,
        latitude: location.latitude,
        longitude: location.longitude
      });
    },
    acceptRide: (rideId) => {
      emitEvent('ride-accepted', {
        rideId,
        driverId: authData.user?.id,
        driverLocation
      });
    },
    rejectRide: (rideId) => {
      emitEvent('ride-rejected', { rideId, driverId: authData.user?.id });
    },
    startRide: (rideId) => {
      emitEvent('ride-started', { rideId, driverId: authData.user?.id });
    },
    completeRide: (rideId, fare, rating) => {
      emitEvent('ride-completed', {
        rideId,
        driverId: authData.user?.id,
        fare,
        rating
      });
    }
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

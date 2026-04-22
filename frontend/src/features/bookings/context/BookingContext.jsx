import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../../../services/api';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [resourceError, setResourceError] = useState(null);

  const fetchBookings = async (status = null) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const params = status ? { status } : {};
      const response = await api.get('/api/bookings', { params });
      setBookings(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data || err.message;
      setBookingError(message);
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchBookingById = async (bookingId) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const response = await api.get(`/api/bookings/${bookingId}`);
      const booking = response.data;
      setBookings(prev => {
        const existingIndex = prev.findIndex(item => item.id === booking.id);
        if (existingIndex !== -1) {
          return prev.map(item => item.id === booking.id ? booking : item);
        }
        return [booking, ...prev];
      });
      return booking;
    } catch (err) {
      const message = err.response?.data || err.message;
      setBookingError(message);
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  const createBooking = async (bookingData) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const response = await api.post('/api/bookings', bookingData);
      const newBooking = response.data;
      setBookings(prev => [newBooking, ...prev]);
      return newBooking;
    } catch (err) {
      const message = err.response?.data || err.message;
      setBookingError(message);
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus, reason = null) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const response = await api.patch(`/api/bookings/${bookingId}`, {
        status: newStatus,
        rejectionReason: reason
      });
      const updatedBooking = response.data;
      setBookings(prev => prev.map(booking => booking.id === bookingId ? updatedBooking : booking));
      return updatedBooking;
    } catch (err) {
      const message = err.response?.data || err.message;
      setBookingError(message);
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setBookingLoading(true);
    setBookingError(null);
    try {
      const response = await api.delete(`/api/bookings/${bookingId}`);
      const cancelledBooking = response.data;
      setBookings(prev => prev.map(booking => booking.id === bookingId ? cancelledBooking : booking));
      return cancelledBooking;
    } catch (err) {
      const message = err.response?.data || err.message;
      setBookingError(message);
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  const fetchResources = async (filters = {}) => {
    setResourceLoading(true);
    setResourceError(null);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.minCapacity) params.minCapacity = parseInt(filters.minCapacity, 10);
      if (filters.maxCapacity) params.maxCapacity = parseInt(filters.maxCapacity, 10);
      if (filters.location) params.location = filters.location;
      if (filters.search) params.search = filters.search;

      const response = await api.get('/api/resources', { params });
      setResources(response.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data || err.message;
      setResourceError(message);
      throw err;
    } finally {
      setResourceLoading(false);
    }
  };

  const getResourceById = async (id) => {
    setResourceLoading(true);
    setResourceError(null);
    try {
      const response = await api.get(`/api/resources/${id}`);
      return response.data;
    } catch (err) {
      const message = err.response?.data || err.message;
      setResourceError(message);
      throw err;
    } finally {
      setResourceLoading(false);
    }
  };

  const getBookingById = (bookingId) => {
    return bookings.find(b => b.id === bookingId);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const value = {
    bookings,
    resources,
    bookingLoading,
    resourceLoading,
    bookingError,
    resourceError,
    fetchBookings,
    fetchBookingById,
    createBooking,
    updateBookingStatus,
    cancelBooking,
    fetchResources,
    getResourceById,
    getBookingById
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

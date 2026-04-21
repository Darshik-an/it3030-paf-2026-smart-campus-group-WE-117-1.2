import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './features/bookings';
import {
  BrowseResources,
  ResourceDetails,
  CreateBooking,
  MyBookings,
  BookingDetails
} from './features/bookings';

// TODO: Replace these with your actual imports once they exist
// import Navbar from './components/layout/Navbar';
// import Sidebar from './components/layout/Sidebar';

const BookingRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/resources" element={<BrowseResources />} />
    <Route path="/resources/:id" element={<ResourceDetails />} />

    {/* Protected Routes (add ProtectedRoute wrapper when auth context is ready) */}
    <Route path="/bookings/create" element={<CreateBooking />} />
    <Route path="/my-bookings" element={<MyBookings />} />
    <Route path="/bookings/:id" element={<BookingDetails />} />
  </Routes>
);

function App() {
  return (
    <Router>
      <BookingProvider>
        {/* 
          TODO: Add your Navbar and Sidebar here
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1">
        */}
        <div>
          <BookingRoutes />
        </div>
        {/* 
            </main>
          </div>
        */}
      </BookingProvider>
    </Router>
  );
}

export default App;

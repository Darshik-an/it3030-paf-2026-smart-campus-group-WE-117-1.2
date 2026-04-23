import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { BookingProvider } from './features/bookings/context/BookingContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import AdminLogin from './features/auth/pages/AdminLogin';
import SignupPage from './features/auth/pages/SignupPage';
import OAuth2Callback from './features/auth/pages/OAuth2Callback';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import TicketingDashboard from './pages/Ticketting/ticketingdashboardpage';
import TicketDetailsPage from './pages/Ticketting/TicketDetailsPage';
import {
  BookingsDashboard,
  CreateBooking,
  MyBookings,
  BookingDetails
} from './features/bookings';

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/oauth2/callback" element={<OAuth2Callback />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/bookings/*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={<Navigate to="/dashboard/bookings" replace />} />
            <Route path="/bookings/create" element={<Navigate to="/dashboard/bookings/create" replace />} />
            <Route path="/my-bookings" element={<Navigate to="/dashboard/bookings/my" replace />} />
            <Route path="/bookings/:id" element={<Navigate to="/dashboard/bookings" replace />} />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <TicketingDashboard />
              </ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <TicketDetailsPage />
              </ProtectedRoute>
            } />

            <Route path="/bookings" element={<Navigate to="/dashboard/bookings" replace />} />
            <Route path="/bookings/create" element={<Navigate to="/dashboard/bookings/create" replace />} />
            <Route path="/my-bookings" element={<Navigate to="/dashboard/bookings/my" replace />} />
            <Route path="/bookings/:id" element={<Navigate to="/dashboard/bookings" replace />} />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
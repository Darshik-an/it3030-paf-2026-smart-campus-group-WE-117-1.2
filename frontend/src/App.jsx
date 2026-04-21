import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/bookings/create" element={
              <ProtectedRoute>
                <CreateBooking />
              </ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute>
                <BookingsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            } />
            <Route path="/bookings/:id" element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            } />
            <Route path="/" element={<LandingPage />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  );
}

export default App;
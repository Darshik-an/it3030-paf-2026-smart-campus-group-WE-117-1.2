import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { BookingProvider } from './features/bookings/context/BookingContext';
import { ToastProvider } from './components/ui/ToastProvider';
import LandingPage from './pages/LandingPage';
import LoginPage from './features/auth/pages/LoginPage';
import AdminLogin from './features/auth/pages/AdminLogin';
import SignupPage from './features/auth/pages/SignupPage';
import OAuth2Callback from './features/auth/pages/OAuth2Callback';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagementPage from './pages/admin/StaffManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import SettingsPage from './pages/admin/SettingsPage';
import ProfilePage from './pages/student/ProfilePage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import TicketingDashboard from './pages/Ticketting/ticketingdashboardpage';
import TicketDetailsPage from './pages/Ticketting/TicketDetailsPage';
import {
  BookingsDashboard,
  CreateBooking,
  MyBookings,
  BookingDetails
} from './features/bookings';
import NotificationsActivityPage from './features/notifications/pages/NotificationsActivityPage';

function App() {
  return (
    <ToastProvider>
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
                <RoleDashboardSwitcher />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/facilities" element={
              <ProtectedRoute>
                <RoleDashboardSwitcher />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/bookings/*" element={
              <ProtectedRoute>
                <RoleDashboardSwitcher />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsActivityPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/staff" element={
              <ProtectedRoute>
                <StaffManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <UserManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />

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
    </ToastProvider>
  );
}

function RoleDashboardSwitcher() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN' || user?.role === 'STUDENT_SUPPORT' || user?.role === 'TECHNICIAN') {
    return <AdminDashboard />;
  }
  return <StudentDashboard />;
}

export default App;
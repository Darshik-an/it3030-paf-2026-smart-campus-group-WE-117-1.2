// Pages
export { default as BookingsDashboard } from './pages/BookingsDashboard';
export { default as CreateBooking } from './pages/CreateBooking';
export { default as MyBookings } from './pages/MyBookings';
export { default as BookingDetails } from './pages/BookingDetails';

// Components
export { default as BookingForm } from './components/BookingForm';
export { default as BookingCard } from './components/BookingCard';
export { default as BookingStatus } from './components/BookingStatus';
export { default as AdminBookings } from './components/admin/AdminBookings';
export { default as AttendanceScanner } from './components/AttendanceScanner';


// Context
export { BookingProvider, useBooking } from './context/BookingContext';

// Data
export { mockResources } from './data/mockResources';

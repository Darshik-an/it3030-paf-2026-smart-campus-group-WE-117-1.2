import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BookingStatus from '../components/BookingStatus';
import { useBooking } from '../context/BookingContext';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getBookingById,
    fetchBookingById,
    cancelBooking,
    bookingLoading,
    bookingError
  } = useBooking();
  const bookingId = parseInt(id, 10);
  const [fetchedBooking, setFetchedBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const booking = getBookingById(bookingId) || fetchedBooking;

  useEffect(() => {
    if (!booking) {
      const loadBooking = async () => {
        try {
          const fetched = await fetchBookingById(bookingId);
          setFetchedBooking(fetched);
        } catch (err) {
          // Error state is handled by bookingError
        }
      };

      loadBooking();
    }
  }, [booking, bookingId]);

  if (bookingLoading && !booking) {
    return (
      <div className="w-full py-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
        <p className="text-slate-600">Loading booking details...</p>
      </div>
    );
  }

  if (bookingError && !booking) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-8 text-center shadow-sm">
          <p className="text-rose-700 text-lg mb-4">{bookingError}</p>
          <Link to="/dashboard/bookings/my" className="text-blue-600 hover:underline font-semibold">
            ← Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center shadow-sm">
          <p className="text-slate-700 text-lg mb-4">Booking not found.</p>
          <Link to="/dashboard/bookings/my" className="text-blue-600 hover:underline font-semibold">
            ← Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setIsCancelling(true);
      try {
        await cancelBooking(booking.id);
        alert('Booking cancelled successfully.');
        navigate('/dashboard/bookings/my');
      } catch (err) {
        alert('Failed to cancel booking.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className="w-full space-y-6">
      <Link
        to="/dashboard/bookings/my"
        className="text-blue-600 hover:underline font-semibold inline-flex items-center transition"
      >
        ← Back to My Bookings
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003049] via-[#0e4f75] to-[#247bb8] text-white p-6 md:p-8">
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-1">
              <p className="text-blue-100 text-sm mb-2">Booking ID: #{booking.id}</p>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{booking.resourceName}</h1>
            </div>
            <BookingStatus status={booking.status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-8">
          {/* Booking Timeline */}
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-900 mb-4">Booking Timeline</h2>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex-1 text-center">
                <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <p className="text-xs md:text-sm text-slate-600">Requested</p>
              </div>
              <div className="flex-1 h-1 bg-slate-300"></div>
              <div className={`flex-1 text-center ${booking.status !== 'PENDING' ? 'opacity-100' : 'opacity-50'}`}>
                <div className={`${booking.status === 'APPROVED' ? 'bg-emerald-100' : 'bg-slate-100'} rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2`}>
                  <span className={booking.status === 'APPROVED' ? 'text-emerald-600 font-bold' : 'text-slate-600'}>✓</span>
                </div>
                <p className="text-xs md:text-sm text-slate-600">Approved</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-slate-600 text-sm font-semibold">📅 Date</p>
                <p className="text-lg text-slate-900 font-black">
                  {formatDate(booking.bookingDate)}
                </p>
              </div>

              <div>
                <p className="text-slate-600 text-sm font-semibold">⏰ Time</p>
                <p className="text-lg text-slate-900 font-black">
                  {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                </p>
              </div>

              <div>
                <p className="text-slate-600 text-sm font-semibold">👥 Expected Attendees</p>
                <p className="text-lg text-slate-900 font-black">{booking.expectedAttendees}</p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <p className="text-slate-600 text-sm font-semibold">📍 Location</p>
                <p className="text-lg text-slate-900 font-black">{booking.location}</p>
              </div>

              <div>
                <p className="text-slate-600 text-sm font-semibold">📝 Purpose</p>
                <p className="text-slate-800">{booking.purpose}</p>
              </div>
            </div>
          </div>

          {/* Rejection Reason */}
          {booking.rejectionReason && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <p className="text-rose-700 font-semibold mb-2">Rejection Reason:</p>
              <p className="text-rose-800">{booking.rejectionReason}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 md:pt-8 flex gap-3 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/bookings/my')}
              className="flex-1 min-w-[150px] bg-slate-200 text-slate-700 py-3 px-6 rounded-lg hover:bg-slate-300 font-semibold transition"
            >
              Back to List
            </button>
            {booking.status === 'APPROVED' && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex-1 min-w-[150px] bg-rose-500 text-white py-3 px-6 rounded-lg hover:bg-rose-600 disabled:bg-slate-400 font-semibold transition"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <h3 className="font-black text-emerald-900 mb-3">Need Help?</h3>
        <ul className="space-y-2 text-emerald-800 text-sm">
          <li>• Contact support if you need to modify this booking.</li>
          <li>• You can only cancel approved bookings.</li>
          <li>• Cancellation notifications will be sent to admins.</li>
        </ul>
      </div>
    </div>
  );
};

export default BookingDetails;

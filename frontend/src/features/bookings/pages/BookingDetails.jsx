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
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Loading booking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (bookingError && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-red-600 text-lg mb-4">{bookingError}</p>
            <Link to="/my-bookings" className="text-blue-500 hover:underline">
              ← Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">Booking not found.</p>
            <Link to="/my-bookings" className="text-blue-500 hover:underline">
              ← Back to My Bookings
            </Link>
          </div>
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
        navigate('/my-bookings');
      } catch (err) {
        alert('Failed to cancel booking.');
      } finally {
        setIsCancelling(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/my-bookings"
          className="text-blue-500 hover:underline mb-6 inline-flex items-center"
        >
          ← Back to My Bookings
        </Link>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-2">Booking ID: #{booking.id}</p>
                <h1 className="text-3xl font-bold">{booking.resourceName}</h1>
              </div>
              <BookingStatus status={booking.status} />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Booking Timeline */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Booking Timeline</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-1 text-center">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <p className="text-sm text-gray-600">Requested</p>
                </div>
                <div className="flex-1 h-1 bg-gray-300"></div>
                <div className={`flex-1 text-center ${booking.status !== 'PENDING' ? 'opacity-100' : 'opacity-50'}`}>
                  <div className={`${booking.status === 'APPROVED' ? 'bg-green-100' : 'bg-gray-100'} rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2`}>
                    <span className={booking.status === 'APPROVED' ? 'text-green-600' : 'text-gray-600'}>✓</span>
                  </div>
                  <p className="text-sm text-gray-600">Approved</p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">📅 Date</p>
                  <p className="text-lg text-gray-900 font-semibold">
                    {formatDate(booking.bookingDate)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm font-medium">⏰ Time</p>
                  <p className="text-lg text-gray-900 font-semibold">
                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm font-medium">👥 Expected Attendees</p>
                  <p className="text-lg text-gray-900 font-semibold">{booking.expectedAttendees}</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 text-sm font-medium">📍 Location</p>
                  <p className="text-lg text-gray-900 font-semibold">{booking.location}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm font-medium">📝 Purpose</p>
                  <p className="text-gray-900">{booking.purpose}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm font-medium">📅 Requested On</p>
                  <p className="text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Rejection Reason */}
            {booking.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-600 font-semibold mb-2">Rejection Reason:</p>
                <p className="text-red-800">{booking.rejectionReason}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-8 flex gap-3">
              <button
                onClick={() => navigate('/my-bookings')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Back to List
              </button>
              {booking.status === 'APPROVED' && (
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 disabled:bg-gray-400 font-semibold"
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• Contact support if you need to modify this booking.</li>
            <li>• You can only cancel approved bookings.</li>
            <li>• Cancellation notifications will be sent to admins.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;

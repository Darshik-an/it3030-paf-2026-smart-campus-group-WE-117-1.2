import React from 'react';
import { Link } from 'react-router-dom';
import BookingStatus from './BookingStatus';

const BookingCard = ({ booking }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const accentByStatus = {
    PENDING: 'border-amber-400',
    APPROVED: 'border-emerald-400',
    REJECTED: 'border-rose-400',
    CANCELLED: 'border-slate-300'
  };

  return (
    <div className={`rounded-2xl border border-slate-200 border-l-4 ${accentByStatus[booking.status] || 'border-blue-400'} bg-white p-4 md:p-5 shadow-sm hover:shadow-md transition`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg text-slate-900">{booking.resourceName}</h3>
          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{booking.purpose}</p>
        </div>
        <BookingStatus status={booking.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-4">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <span className="text-slate-500">Date</span>
          <p className="font-semibold text-slate-900">{formatDate(booking.bookingDate)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <span className="text-slate-500">Time</span>
          <p className="font-semibold text-slate-900">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <span className="text-slate-500">Attendees</span>
          <p className="font-semibold text-slate-900">{booking.expectedAttendees}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <span className="text-slate-500">Location</span>
          <p className="font-semibold text-slate-900 text-xs md:text-sm">{booking.location}</p>
        </div>
      </div>

      {booking.rejectionReason && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3">
          <p className="text-sm text-rose-800">
            <strong>Reason:</strong> {booking.rejectionReason}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Link to={`/bookings/${booking.id}`} className="sm:flex-1">
          <button className="w-full bg-[#003049] text-white py-2.5 px-4 rounded-lg hover:bg-[#022338] text-sm font-semibold transition">
            View Details
          </button>
        </Link>
        {booking.status === 'APPROVED' && (
          <button className="sm:flex-1 bg-red-500 text-white py-2.5 px-4 rounded-lg hover:bg-red-600 text-sm font-semibold transition">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;

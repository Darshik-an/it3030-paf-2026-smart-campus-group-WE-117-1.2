import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import BookingCard from '../components/BookingCard';
import { useBooking } from '../context/BookingContext';

const MyBookings = () => {
  const { bookings, bookingLoading, bookingError } = useBooking();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const statusCounts = {
    ALL: bookings.length,
    PENDING: bookings.filter((b) => b.status === 'PENDING').length,
    APPROVED: bookings.filter((b) => b.status === 'APPROVED').length,
    REJECTED: bookings.filter((b) => b.status === 'REJECTED').length,
    CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length
  };

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === filterStatus);

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const aTime = new Date(a.createdAt || a.bookingDate).getTime();
    const bTime = new Date(b.createdAt || b.bookingDate).getTime();
    return bTime - aTime;
  });

  if (bookingLoading && bookings.length === 0) {
    return (
      <div className="w-full py-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
        <p className="text-slate-600">Loading your bookings...</p>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="w-full py-12 text-center rounded-2xl bg-rose-50 border border-rose-200">
        <p className="text-rose-700">{bookingError}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-[#003049] via-[#0a4d73] to-[#1d6fa5] p-6 md:p-8 text-white shadow-xl shadow-slate-300/40">
        <div className="absolute -top-12 -right-10 h-36 w-36 rounded-full bg-[#FCBF49]/30 blur-2xl" aria-hidden="true"></div>
        <div className="absolute -bottom-14 right-20 h-44 w-44 rounded-full bg-[#F77F00]/20 blur-3xl" aria-hidden="true"></div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide hover:bg-white/20 transition"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <p className="inline-flex items-center rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
              BOOKINGS HUB
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">My Bookings</h1>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-blue-100/90">
              Track all requests, review status changes quickly, and create your next booking in seconds.
            </p>
          </div>
          <Link
            to="/bookings/create"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#003049] shadow hover:bg-slate-100 transition"
          >
            + New Booking
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { key: 'ALL', label: 'Total', value: statusCounts.ALL, tone: 'bg-slate-900 text-white border-slate-900' },
          { key: 'PENDING', label: 'Pending', value: statusCounts.PENDING, tone: 'bg-amber-50 text-amber-800 border-amber-200' },
          { key: 'APPROVED', label: 'Approved', value: statusCounts.APPROVED, tone: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
          { key: 'REJECTED', label: 'Rejected', value: statusCounts.REJECTED, tone: 'bg-rose-50 text-rose-800 border-rose-200' },
          { key: 'CANCELLED', label: 'Cancelled', value: statusCounts.CANCELLED, tone: 'bg-slate-100 text-slate-700 border-slate-200' }
        ].map((stat) => (
          <div key={stat.key} className={`rounded-2xl border p-4 ${stat.tone}`}>
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{stat.label}</p>
            <p className="mt-2 text-2xl font-black leading-none">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'ALL', label: 'All Bookings' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'CANCELLED', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                filterStatus === tab.value
                  ? 'bg-[#003049] text-white shadow'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
              {statusCounts[tab.value] > 0 && (
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filterStatus === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {statusCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Bookings List */}
      {sortedBookings.length > 0 ? (
        <div className="space-y-4">
          {sortedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">No bookings in this view yet</h2>
          <p className="text-slate-600 text-base mb-6">
            {filterStatus === 'ALL'
              ? 'You have no bookings yet.'
              : `You have no ${filterStatus.toLowerCase()} bookings.`}
          </p>
          <Link
            to="/bookings/create"
            className="inline-flex items-center rounded-xl bg-[#003049] px-6 py-3 text-white font-semibold hover:bg-[#022338] transition"
          >
            Create a Booking
          </Link>
        </div>
      )}

      {/* Info Box */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 md:p-5">
        <p className="text-sm text-emerald-800">
          <strong>Tip:</strong> Approved bookings can be cancelled from the booking details page. Pending and rejected requests remain read-only.
        </p>
      </div>
    </div>
  );
};

export default MyBookings;

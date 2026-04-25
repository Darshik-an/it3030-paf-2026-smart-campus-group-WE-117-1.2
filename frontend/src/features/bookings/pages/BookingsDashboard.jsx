import React from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';

const BookingsDashboard = () => {
  const { bookings } = useBooking();

  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'PENDING').length,
    approved: bookings.filter((b) => b.status === 'APPROVED').length,
    rejected: bookings.filter((b) => b.status === 'REJECTED').length
  };

  const latestBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-[#003049] via-[#0e4f75] to-[#247bb8] p-6 md:p-8 text-white shadow-xl shadow-slate-300/40">
        <div className="absolute -top-16 -right-8 h-44 w-44 rounded-full bg-[#FCBF49]/30 blur-3xl" aria-hidden="true"></div>
        <div className="absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-[#F77F00]/20 blur-3xl" aria-hidden="true"></div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wider">BOOKINGS DASHBOARD</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">Plan. Reserve. Manage.</h2>
            <p className="mt-2 max-w-2xl text-sm md:text-base text-blue-100/90">
              Keep your booking workflow in one place. Create requests quickly and monitor approvals without switching tabs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard/bookings/my"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#003049] hover:bg-slate-100 transition"
            >
              Go to My Bookings
            </Link>
            <Link
              to="/dashboard/bookings/create"
              className="inline-flex items-center justify-center rounded-xl bg-[#F77F00] px-5 py-3 text-sm font-bold text-white hover:bg-[#dc7304] transition"
            >
              Create Booking
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">Total Requests</p>
          <p className="mt-2 text-3xl font-black text-slate-900">{counts.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-amber-700">Pending</p>
          <p className="mt-2 text-3xl font-black text-amber-800">{counts.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">Approved</p>
          <p className="mt-2 text-3xl font-black text-emerald-800">{counts.approved}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide font-semibold text-rose-700">Rejected</p>
          <p className="mt-2 text-3xl font-black text-rose-800">{counts.rejected}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">Recent Activity</h3>
          <Link to="/dashboard/bookings/my" className="text-sm font-semibold text-[#003049] hover:underline">
            View all
          </Link>
        </div>

        {latestBookings.length > 0 ? (
          <div className="space-y-3">
            {latestBookings.map((booking) => (
              <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{booking.resourceName}</p>
                  <p className="text-sm text-slate-600">{booking.purpose}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-white border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 w-fit">
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-slate-600">No bookings yet. Start with your first request.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default BookingsDashboard;

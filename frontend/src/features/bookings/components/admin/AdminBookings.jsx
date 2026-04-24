import React, { useEffect, useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import BookingStatus from '../BookingStatus';
import { CheckCircle, XCircle, Clock, Search, User } from 'lucide-react';

const AdminBookings = () => {
  const { bookings, fetchBookings, updateBookingStatus, bookingLoading } = useBooking();
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      let reason = null;
      if (status === 'REJECTED') {
        reason = prompt('Please enter a reason for rejection:');
        if (reason === null) return; // User cancelled prompt
      }
      await updateBookingStatus(id, status, reason);
      alert(`Booking ${status.toLowerCase()} successfully`);
    } catch (err) {
      alert('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const safeStatus = booking.status || '';
    const matchesStatus = filter === 'ALL' || safeStatus === filter;
    const matchesSearch = 
      (booking.resourceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.purpose || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'No Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString || typeof timeString !== 'string') return '';
    // Handle LocalTime format from backend
    return timeString.substring(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-[#003049] tracking-tight">Booking Management</h2>
          <p className="text-slate-500 font-medium">Review and manage all campus resource requests from students and staff.</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                filter === s 
                  ? 'bg-white text-[#003049] shadow-sm' 
                  : 'text-slate-500 hover:text-[#003049]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#003049] transition-colors" />
        <input
          type="text"
          placeholder="Search by resource, user or purpose..."
          className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-5 pl-14 pr-6 focus:ring-4 focus:ring-[#003049]/5 focus:border-[#003049] outline-none transition-all shadow-sm text-slate-700 font-medium placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {bookingLoading ? (
          <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#003049]/10 border-t-[#003049]"></div>
            <p className="text-slate-500 font-bold animate-pulse">Loading bookings...</p>
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all border-l-8 border-l-[#003049] group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex-1 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-2xl text-[#003049] group-hover:text-[#F77F00] transition-colors">{booking.resourceName}</h3>
                        <BookingStatus status={booking.status} />
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <User className="w-4 h-4 text-[#F77F00]" />
                        <span>Requested by: <span className="text-[#003049]">{booking.userName || 'Unknown User'}</span></span>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[140px]">
                      <p className="font-black text-[#003049] text-base">{formatDate(booking.bookingDate)}</p>
                      <p className="text-xs font-bold text-[#F77F00] uppercase tracking-widest mt-1">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200"></div>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      <span className="font-black text-[#003049] text-xs uppercase tracking-widest block mb-2 opacity-50">Purpose of Booking</span>
                      "{booking.purpose}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-3 min-w-[180px]">
                  {booking.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'APPROVED')}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-4 rounded-2xl font-black hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-emerald-500/20 text-sm uppercase tracking-wider"
                      >
                        <CheckCircle className="w-5 h-5" /> Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}
                        className="flex-1 flex items-center justify-center gap-2 bg-rose-500 text-white px-6 py-4 rounded-2xl font-black hover:bg-rose-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-rose-500/20 text-sm uppercase tracking-wider"
                      >
                        <XCircle className="w-5 h-5" /> Reject
                      </button>
                    </>
                  )}
                  {booking.status === 'REJECTED' && booking.rejectionReason && (
                    <div className="bg-rose-50 border-2 border-rose-100 rounded-2xl p-5 relative">
                      <div className="absolute -top-3 left-4 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">Reason</div>
                      <p className="text-sm text-rose-700 font-bold leading-tight">{booking.rejectionReason}</p>
                    </div>
                  )}
                  {booking.status === 'APPROVED' && (
                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 text-center">
                      <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Successfully Approved</p>
                    </div>
                  )}
                  {booking.status === 'CANCELLED' && (
                    <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-center">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">User Cancelled</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-24 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-[#003049] mb-2">No bookings found</h3>
            <p className="text-slate-400 font-bold max-w-xs mx-auto">There are no resource requests matching your current filters or search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookings;

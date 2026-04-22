import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import { useBooking } from '../context/BookingContext';

const CreateBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    createBooking,
    bookingLoading,
    bookingError,
    resources
  } = useBooking();

  const resourceId = searchParams.get('resourceId');

  const handleSubmit = async (formData) => {
    try {
      await createBooking(formData);
      alert('Booking request submitted successfully!');
      navigate('/dashboard/bookings/my');
    } catch (err) {
      console.error('Error creating booking:', err);
      alert('Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="w-full space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-[#003049] via-[#0e4f75] to-[#247bb8] p-6 md:p-8 text-white shadow-xl shadow-slate-300/40">
        <div className="absolute -top-14 -right-10 h-40 w-40 rounded-full bg-[#FCBF49]/30 blur-3xl" aria-hidden="true"></div>
        <div className="absolute -bottom-14 left-6 h-44 w-44 rounded-full bg-[#F77F00]/20 blur-3xl" aria-hidden="true"></div>

        <div className="relative z-10">
          <button
            onClick={() => navigate('/dashboard/bookings')}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-white hover:bg-white/25 mb-4 font-medium transition-colors border border-white/30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Create Booking Request</h1>
          <p className="text-blue-100/90 text-sm md:text-base max-w-xl">
            Submit your request with time, purpose, and attendees. You can monitor approval updates from My Bookings.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Choose Resource</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Pick Date & Time</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Add Purpose</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 4</p>
          <p className="mt-1 text-sm font-bold text-slate-900">Submit</p>
        </div>
      </div>

      {bookingError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{bookingError}</p>
          </div>
        </div>
      )}

      <BookingForm
        onSubmit={handleSubmit}
        isLoading={bookingLoading}
        resources={resources}
        initialResourceId={resourceId}
      />

      <div className="bg-white/95 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• Your booking request will be pending until approved by an admin.</li>
              <li>• You'll receive a notification once your request is reviewed.</li>
              <li>• Ensure the requested time slot doesn't conflict with other bookings.</li>
              <li>• You can cancel approved bookings from the My Bookings page.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;

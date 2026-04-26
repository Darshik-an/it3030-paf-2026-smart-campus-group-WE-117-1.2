import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const BookingForm = ({ onSubmit, isLoading = false, resources = [], initialResourceId = null }) => {
  const BUSINESS_START_TIME = '08:00';
  const BUSINESS_END_TIME = '17:30';
  const today = new Date().toISOString().split('T')[0];
  const [availableResources, setAvailableResources] = useState([]);
  const [resourceAvailability, setResourceAvailability] = useState({});
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  useEffect(() => {
    // Ensure resources is always an array
    setAvailableResources(Array.isArray(resources) ? resources : []);
  }, [resources]);
  const [formData, setFormData] = useState({
    resourceId: initialResourceId || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1
  });

  const [errors, setErrors] = useState({});

  const selectedResource = availableResources.find(
    (resource) => String(resource.id) === String(formData.resourceId)
  );

  const hasValidSchedule =
    !!formData.bookingDate &&
    !!formData.startTime &&
    !!formData.endTime &&
    formData.startTime < formData.endTime;

  useEffect(() => {
    let cancelled = false;

    const checkAvailability = async () => {
      const activeResources = availableResources.filter((resource) => resource.status === 'ACTIVE');

      if (!hasValidSchedule || activeResources.length === 0) {
        setResourceAvailability({});
        setCheckingAvailability(false);
        return;
      }

      setCheckingAvailability(true);
      try {
        const checks = await Promise.all(
          activeResources.map(async (resource) => {
            const response = await api.get('/api/bookings/check-conflict', {
              params: {
                resourceId: resource.id,
                date: formData.bookingDate,
                startTime: formData.startTime,
                endTime: formData.endTime,
              },
            });
            return [resource.id, !response.data?.hasConflict];
          })
        );

        if (!cancelled) {
          setResourceAvailability(Object.fromEntries(checks));
        }
      } catch {
        if (!cancelled) {
          setResourceAvailability({});
        }
      } finally {
        if (!cancelled) {
          setCheckingAvailability(false);
        }
      }
    };

    checkAvailability();
    return () => {
      cancelled = true;
    };
  }, [availableResources, hasValidSchedule, formData.bookingDate, formData.startTime, formData.endTime]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const parsedResourceId = Number(formData.resourceId);
    const parsedAttendees = Number(formData.expectedAttendees);
    const selectedResourceCapacity = selectedResource?.capacity;

    if (!formData.resourceId) {
      newErrors.resourceId = 'Please select a resource';
    } else if (!Number.isInteger(parsedResourceId) || parsedResourceId <= 0) {
      newErrors.resourceId = 'Selected resource is invalid';
    } else if (hasValidSchedule && resourceAvailability[parsedResourceId] === false) {
      newErrors.resourceId = 'Selected facility is already booked for this time';
    }
    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Please select a date';
    } else if (formData.bookingDate < today) {
      newErrors.bookingDate = 'Booking date cannot be in the past';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Please select start time';
    }
    if (!formData.endTime) {
      newErrors.endTime = 'Please select end time';
    }
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }
    if (formData.startTime && formData.startTime < BUSINESS_START_TIME) {
      newErrors.startTime = 'Start time must be at or after 08:00';
    }
    if (formData.endTime && formData.endTime > BUSINESS_END_TIME) {
      newErrors.endTime = 'End time must be at or before 17:30';
    }
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please enter the purpose of booking';
    }
    if (!Number.isInteger(parsedAttendees) || parsedAttendees < 1) {
      newErrors.expectedAttendees = 'Expected attendees must be at least 1';
    } else if (
      Number.isInteger(parsedResourceId) &&
      parsedResourceId > 0 &&
      Number.isInteger(selectedResourceCapacity) &&
      parsedAttendees > selectedResourceCapacity
    ) {
      newErrors.expectedAttendees = `Expected attendees cannot exceed selected resource capacity (${selectedResourceCapacity})`;
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      ...formData,
      resourceId: Number(formData.resourceId),
      expectedAttendees: Number(formData.expectedAttendees),
      purpose: formData.purpose.trim()
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-5 md:p-8 max-w-3xl mx-auto border border-white/60">
      <div className="grid grid-cols-1 gap-6">
        {/* Resource Selection */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Resource <span className="text-red-500">*</span>
          </label>
          <select
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.resourceId ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          >
            <option value="">Select a resource</option>
            {availableResources
              .filter((resource) => resource.status === 'ACTIVE')
              .map((resource) => {
                const isUnavailable = hasValidSchedule && resourceAvailability[resource.id] === false;
                return (
                  <option key={resource.id} value={resource.id} disabled={isUnavailable}>
                    {resource.name} ({resource.type}) - ID: {resource.resourceCode || `FAC-${resource.id}`} - Capacity: {resource.capacity}
                    {isUnavailable ? ' - Unavailable for selected time' : ''}
                  </option>
                );
              })}
          </select>
          {errors.resourceId && <p className="mt-2 text-sm text-red-600 font-medium">{errors.resourceId}</p>}
          {hasValidSchedule && checkingAvailability && (
            <p className="mt-2 text-sm text-slate-500 font-medium">Checking facility availability for the selected time...</p>
          )}
        </div>

        {/* Booking Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Booking Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={today}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.bookingDate ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.bookingDate && <p className="mt-2 text-sm text-red-600 font-medium">{errors.bookingDate}</p>}
        </div>

        {/* Time Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Start Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              min={BUSINESS_START_TIME}
              max={BUSINESS_END_TIME}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.startTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.startTime && <p className="mt-2 text-sm text-red-600 font-medium">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              End Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              min={BUSINESS_START_TIME}
              max={BUSINESS_END_TIME}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                errors.endTime ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
              }`}
            />
            {errors.endTime && <p className="mt-2 text-sm text-red-600 font-medium">{errors.endTime}</p>}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Purpose <span className="text-red-500">*</span>
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            placeholder="Describe the purpose of your booking..."
            rows="3"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-y min-h-[110px] ${
              errors.purpose ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {errors.purpose && <p className="mt-2 text-sm text-red-600 font-medium">{errors.purpose}</p>}
        </div>

        {/* Expected Attendees */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Expected Attendees <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="expectedAttendees"
            value={formData.expectedAttendees}
            onChange={handleChange}
            min="1"
            max={selectedResource?.capacity || undefined}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.expectedAttendees ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
          {selectedResource?.capacity && (
            <p className="mt-2 text-sm text-slate-600 font-medium">
              Selected resource capacity: {selectedResource.capacity}
            </p>
          )}
          {errors.expectedAttendees && <p className="mt-2 text-sm text-red-600 font-medium">{errors.expectedAttendees}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 md:pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 font-semibold transition shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Booking Request'
            )}
          </button>
          <button
            type="reset"
            onClick={() => setFormData({
              resourceId: initialResourceId || '',
              bookingDate: '',
              startTime: '',
              endTime: '',
              purpose: '',
              expectedAttendees: 1
            })}
            className="sm:w-auto w-full px-6 bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 font-semibold transition border border-gray-200"
          >
            Clear
          </button>
        </div>
      </div>
    </form>
  );
};

export default BookingForm;

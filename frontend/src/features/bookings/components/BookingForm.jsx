import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

const BookingForm = ({ onSubmit, isLoading = false, resources = [], initialResourceId = null }) => {
  // Mock resources for dropdown
  const mockResources = [
    { id: 1, name: 'Meeting Room A', type: 'MEETING_ROOM', capacity: 10, location: 'Building 1, 2nd Floor' },
    { id: 2, name: 'Lab 101', type: 'LAB', capacity: 25, location: 'Science Building, 1st Floor' },
    { id: 3, name: 'Lecture Hall 1', type: 'LECTURE_HALL', capacity: 100, location: 'Main Hall' },
    { id: 4, name: 'Equipment Set A', type: 'AUDITORIUM', capacity: 5, location: 'Workshop' },
    { id: 5, name: 'Meeting Room B', type: 'MEETING_ROOM', capacity: 15, location: 'Building 2, 3rd Floor' },
    { id: 6, name: 'Lab 102', type: 'LAB', capacity: 20, location: 'Science Building, 2nd Floor' }
  ];

  const [availableResources, setAvailableResources] = useState([]);

  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (formData.bookingDate && formData.startTime && formData.endTime && formData.startTime < formData.endTime) {
        setIsChecking(true);
        try {
          const availableList = [];
          const sourceResources = resources.length > 0 ? resources : mockResources;
          for (const resource of sourceResources) {
            const res = await api.get('/api/bookings/check-conflict', {
              params: {
                resourceId: resource.id,
                date: formData.bookingDate,
                startTime: formData.startTime,
                endTime: formData.endTime
              }
            });
            if (!res.data.hasConflict) {
              availableList.push(resource);
            }
          }
          setAvailableResources(availableList);
          
          if (formData.resourceId && !availableList.find(r => r.id === Number(formData.resourceId))) {
            setFormData(prev => ({ ...prev, resourceId: '' }));
          }
        } catch (error) {
          console.error("Error checking availability:", error);
          setAvailableResources(resources.length > 0 ? resources : mockResources);
        } finally {
          setIsChecking(false);
        }
      } else {
        setAvailableResources(resources.length > 0 ? resources : mockResources);
      }
    };
    
    checkAvailability();
  }, [formData.bookingDate, formData.startTime, formData.endTime, resources]);
  const [formData, setFormData] = useState({
    resourceId: initialResourceId || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: 1
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.resourceId) {
      newErrors.resourceId = 'Please select a resource';
    }
    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Please select a date';
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
    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Please enter the purpose of booking';
    }
    if (formData.expectedAttendees < 1) {
      newErrors.expectedAttendees = 'Expected attendees must be at least 1';
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

    onSubmit({
      ...formData,
      resourceId: parseInt(formData.resourceId, 10)
    });
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
            <option value="">{isChecking ? 'Checking availability...' : 'Select a resource'}</option>
            {availableResources.map(resource => (
              <option key={resource.id} value={resource.id}>
                [ID: {resource.id}] {resource.name} ({resource.type}) - Capacity: {resource.capacity}
              </option>
            ))}
          </select>
          {errors.resourceId && <p className="mt-2 text-sm text-red-600 font-medium">{errors.resourceId}</p>}
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
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.expectedAttendees ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
            }`}
          />
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

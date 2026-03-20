import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { reservationApi } from '../api/reservationApi';
import { roomApi } from '../api/roomApi';
import { useAuth } from '../context/AuthContext';

export default function ReservationFormPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState(null);

  const [formData, setFormData] = useState({
    roomId: searchParams.get('roomId') || '',
    applicantName: user?.name || '',
    organization: user?.organization || '',
    email: user?.email || '',
    phone: user?.phone || '',
    startDatetime: '',
    endDatetime: '',
    eventDescription: '',
    requestType: 'SIMPLE',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await roomApi.getActive();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.roomId || !formData.startDatetime || !formData.endDatetime) return;
    
    try {
      const response = await roomApi.checkAvailability(
        formData.roomId,
        formData.startDatetime,
        formData.endDatetime
      );
      setAvailability(response.data);
    } catch (error) {
      console.error('Failed to check availability:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setAvailability(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await reservationApi.create(formData);
      navigate('/reservations');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      SIMPLE: 'Simple Request',
      AGREEMENT: 'Agreement (Convenio)',
      EXCHANGE: 'Exchange (Canje)',
      CORPORATE: 'Corporate (Paid Event)',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/rooms" className="text-gray-500 hover:text-gray-700 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to rooms
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Reservation Request</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Room *</label>
            <select
              name="roomId"
              required
              value={formData.roomId}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a room</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} (Capacity: {room.capacity})
                </option>
              ))}
            </select>
          </div>

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Request Type *</label>
            <select
              name="requestType"
              required
              value={formData.requestType}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {Object.keys({ SIMPLE: 'Simple', AGREEMENT: 'Agreement', EXCHANGE: 'Exchange', CORPORATE: 'Corporate' }).map(type => (
                <option key={type} value={type}>{getRequestTypeLabel(type)}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Corporate requests require Senior Director approval. Exception requests (for occupied rooms) also require senior review.
            </p>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
              <input
                type="datetime-local"
                name="startDatetime"
                required
                value={formData.startDatetime}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
              <input
                type="datetime-local"
                name="endDatetime"
                required
                value={formData.endDatetime}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Check Availability Button */}
          {formData.roomId && formData.startDatetime && formData.endDatetime && (
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={checkAvailability}
                className="px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                Check Availability
              </button>
              {availability && (
                <span className={`text-sm ${availability.available ? 'text-green-600' : 'text-orange-600'}`}>
                  {availability.available ? '✓ Room is available' : '⚠ Room is occupied - will require exception approval'}
                </span>
              )}
            </div>
          )}

          {/* Applicant Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Applicant Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="applicantName"
                  required
                  value={formData.applicantName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Description</label>
            <textarea
              name="eventDescription"
              rows={4}
              value={formData.eventDescription}
              onChange={handleChange}
              placeholder="Describe your event, its purpose, and any special requirements..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
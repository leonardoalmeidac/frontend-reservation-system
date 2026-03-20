import { useState, useEffect } from 'react';
import { reservationApi } from '../api/reservationApi';
import { useAuth } from '../context/AuthContext';

export default function PendingApprovals() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await reservationApi.getPending();
      setReservations(response.data);
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await reservationApi.approve(id);
      fetchPendingApprovals();
      setSelectedReservation(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setActionLoading(true);
    try {
      await reservationApi.reject(id, notes);
      fetchPendingApprovals();
      setSelectedReservation(null);
      setNotes('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject reservation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async (id) => {
    if (!notes.trim()) {
      alert('Please provide the information you need');
      return;
    }
    setActionLoading(true);
    try {
      await reservationApi.requestInfo(id, notes);
      fetchPendingApprovals();
      setSelectedReservation(null);
      setNotes('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to request information');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VALIDATION: 'bg-blue-100 text-blue-800',
      EXCEPTION: 'bg-orange-100 text-orange-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      SIMPLE: 'Simple Request',
      AGREEMENT: 'Agreement',
      EXCHANGE: 'Exchange',
      CORPORATE: 'Corporate',
    };
    return labels[type] || type;
  };

  const canApprove = (reservation) => {
    if (user.role === 'ADMIN') return true;
    if (reservation.isException) return user.role === 'DIRECTOR_LEVEL_2';
    if (reservation.requestType === 'CORPORATE') return user.role === 'DIRECTOR_LEVEL_2';
    return user.role === 'DIRECTOR_LEVEL_1' || user.role === 'DIRECTOR_LEVEL_2';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
          <p className="mt-1 text-sm text-gray-500">All requests have been reviewed.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reservations.map(reservation => (
            <div key={reservation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{reservation.roomName}</h3>
                  <p className="text-sm text-gray-500">{reservation.applicantName}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(reservation.status)}`}>
                    {reservation.status}
                  </span>
                  {reservation.isException && (
                    <span className="px-2 py-1 text-xs font-medium rounded bg-orange-100 text-orange-800">
                      Exception
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="text-gray-900">
                    {new Date(reservation.startDatetime).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="text-gray-900">
                    {new Date(reservation.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(reservation.endDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-900">{getRequestTypeLabel(reservation.requestType)}</span>
                </div>
                {reservation.organization && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Organization:</span>
                    <span className="text-gray-900">{reservation.organization}</span>
                  </div>
                )}
              </div>

              {reservation.eventDescription && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{reservation.eventDescription}</p>
                </div>
              )}

              {!canApprove(reservation) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    This request requires Senior Director (Level 2) approval due to: 
                    {reservation.isException && ' exception status'}
                    {reservation.requestType === 'CORPORATE' && (reservation.isException ? ' and corporate type' : ' corporate type')}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setSelectedReservation(reservation)}
                  className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Review
                </button>
                {canApprove(reservation) && (
                  <>
                    <button
                      onClick={() => handleApprove(reservation.id)}
                      className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedReservation({ ...reservation, action: 'reject' })}
                      className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedReservation.action === 'reject' ? 'Reject Reservation' : 'Review Reservation'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <p className="font-medium text-gray-900">{selectedReservation.roomName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium text-gray-900">{selectedReservation.applicantName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedReservation.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Description</p>
                <p className="text-gray-900">{selectedReservation.eventDescription || 'No description provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {selectedReservation.action === 'reject' ? 'Rejection Reason' : 'Notes (optional)'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={selectedReservation.action === 'reject' ? 'Provide reason for rejection...' : 'Add any notes...'}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedReservation(null); setNotes(''); }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {selectedReservation.action === 'reject' ? (
                <button
                  onClick={() => handleReject(selectedReservation.id)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              ) : (
                <button
                  onClick={() => handleRequestInfo(selectedReservation.id)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Sending...' : 'Request More Info'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
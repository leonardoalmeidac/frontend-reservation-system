import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomApi } from '../api/roomApi';
import { reservationApi } from '../api/reservationApi';

export default function RoomDetail() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoomData();
  }, [id]);

  const fetchRoomData = async () => {
    try {
      const [roomRes, calendarRes] = await Promise.all([
        roomApi.getById(id),
        reservationApi.getCalendar(
          new Date().toISOString(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        ),
      ]);
      setRoom(roomRes.data);
      setReservations(calendarRes.data.filter(r => r.roomId === parseInt(id)));
    } catch (error) {
      console.error('Failed to fetch room:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Room not found</h2>
        <Link to="/rooms" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
          Back to rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/rooms" className="text-gray-500 hover:text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Room Details</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium text-gray-900">{room.location || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-medium text-gray-900">{room.capacity} people</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${room.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {room.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {room.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900">{room.description}</p>
              </div>
            )}
          </div>

          <Link
            to={`/reservations/new?roomId=${id}`}
            className="mt-6 block w-full px-4 py-2 text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Reserve This Room
          </Link>
        </div>

        {/* Upcoming Reservations */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Reservations</h2>
          
          {reservations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No upcoming reservations</p>
          ) : (
            <div className="space-y-3">
              {reservations.map(reservation => (
                <div key={reservation.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{reservation.applicantName}</h4>
                      <p className="text-sm text-gray-500">{reservation.eventDescription}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(reservation.startDatetime).toLocaleDateString()} at{' '}
                        {new Date(reservation.startDatetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
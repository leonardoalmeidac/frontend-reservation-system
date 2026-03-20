import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { reservationApi } from '../api/reservationApi';
import { roomApi } from '../api/roomApi';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [selectedRoom]);

  const fetchData = async () => {
    try {
      const [roomsRes] = await Promise.all([roomApi.getActive()]);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      const calendarApi = calendarRef.current?.getApi();
      if (!calendarApi) return;

      const start = calendarApi.view.activeStart.toISOString();
      const end = calendarApi.view.activeEnd.toISOString();

      const response = await reservationApi.getCalendar(start, end);
      let filtered = response.data;

      if (selectedRoom !== 'all') {
        filtered = filtered.filter(r => r.roomId === parseInt(selectedRoom));
      }

      setReservations(filtered);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    }
  };

  const getEventColor = (status, requestType) => {
    if (status === 'APPROVED') {
      const colors = {
        SIMPLE: '#10b981',
        AGREEMENT: '#3b82f6',
        EXCHANGE: '#8b5cf6',
        CORPORATE: '#f59e0b',
      };
      return colors[requestType] || '#10b981';
    }
    return '#6b7280';
  };

  const events = reservations.map(reservation => ({
    id: reservation.id,
    title: `${reservation.roomName} - ${reservation.applicantName}`,
    start: reservation.startDatetime,
    end: reservation.endDatetime,
    backgroundColor: getEventColor(reservation.status, reservation.requestType),
    borderColor: getEventColor(reservation.status, reservation.requestType),
    extendedProps: {
      status: reservation.status,
      requestType: reservation.requestType,
      roomName: reservation.roomName,
      applicantName: reservation.applicantName,
      email: reservation.email,
      organization: reservation.organization,
      eventDescription: reservation.eventDescription,
    },
  }));

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  const handleDatesSet = () => {
    fetchReservations();
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Reservation Calendar</h1>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Rooms</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className="text-sm text-gray-600">Simple Request</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500"></div>
          <span className="text-sm text-gray-600">Agreement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500"></div>
          <span className="text-sm text-gray-600">Exchange</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-sm text-gray-600">Corporate</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
        />
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Reservation Details</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Room</p>
                <p className="font-medium text-gray-900">{selectedEvent.roomName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Applicant</p>
                <p className="font-medium text-gray-900">{selectedEvent.applicantName}</p>
              </div>
              {selectedEvent.organization && (
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="font-medium text-gray-900">{selectedEvent.organization}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{selectedEvent.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Request Type</p>
                <p className="font-medium text-gray-900">{selectedEvent.requestType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                  selectedEvent.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEvent.status}
                </span>
              </div>
              {selectedEvent.eventDescription && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-900">{selectedEvent.eventDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
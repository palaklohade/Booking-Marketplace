import React from 'react';
import { Appointment, Availability } from '../types';

interface Props {
  appointments: Appointment[];
  availability: Availability | null;
}

const CalendarView: React.FC<Props> = ({ appointments, availability }) => {
  // This is a simplified view. A real implementation would use a calendar library.
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Your Weekly Schedule</h2>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold">Your Availability</h3>
        {availability ? (
          <div>
            <p>Working Days: {Object.entries(availability.days).filter(([, val]) => val).map(([day]) => day).join(', ')}</p>
            <p>Hours: {availability.start_time} - {availability.end_time}</p>
          </div>
        ) : (
          <p>No availability set.</p>
        )}
      </div>
      <div className="border rounded-lg p-4 mt-4">
        <h3 className="font-semibold">Upcoming Appointments</h3>
        {appointments.length > 0 ? (
          <ul>
            {appointments.map(appt => (
              <li key={appt.id} className="mb-2">
                <strong>{new Date(appt.start_time).toLocaleDateString()}</strong>: {new Date(appt.start_time).toLocaleTimeString()} - {new Date(appt.end_time).toLocaleTimeString()} with {appt.buyer_name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming appointments.</p>
        )}
      </div>
    </div>
  );
};

export default CalendarView;

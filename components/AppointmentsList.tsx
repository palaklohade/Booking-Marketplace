// AppointmentsList.tsx
import React, { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { fetchAppointments } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface AppointmentsListProps {
  showBuyerDetails?: boolean;
  showSellerDetails?: boolean;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({
  showBuyerDetails,
  showSellerDetails,
}) => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const loadAppointments = async () => {
      setLoading(true);
      const data = await fetchAppointments(currentUser.id);
      setAppointments(data);
      setLoading(false);
    };
    loadAppointments();
  }, [currentUser]);

  if (loading) return <p>Loading appointments...</p>;
  if (appointments.length === 0) return <p>No appointments scheduled.</p>;

  return (
    <div className="space-y-4">
      {appointments.map((appt) => (
        <div
          key={appt.id}
          className="bg-white p-4 rounded-md shadow-sm flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{appt.title}</p>
            <p className="text-sm text-gray-500">
              {new Date(appt.start_time).toLocaleString()} -{' '}
              {new Date(appt.end_time).toLocaleTimeString()}
            </p>
            {showBuyerDetails && (
              <p className="text-sm text-gray-600">
                Buyer: {appt.buyer_name} ({appt.buyer_email})
              </p>
            )}
            {showSellerDetails && (
              <p className="text-sm text-gray-600">
                Seller: {appt.seller_name} ({appt.seller_email})
              </p>
            )}
          </div>
          <a
            href={appt.meeting_link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Join
          </a>
        </div>
      ))}
    </div>
  );
};

export default AppointmentsList;
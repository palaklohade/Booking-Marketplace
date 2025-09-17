import React, { useState, useEffect } from 'react';
import { Seller, TimeSlot } from '../types';
import { fetchSellers, createAppointment } from '../services/api';
import BookingModal from './BookingModal';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SellerSearch: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadSellers = async () => {
      try {
        const data = await fetchSellers();
        setSellers(data);
      } catch (error) {
        console.error('Error fetching sellers:', error);
      }
    };
    loadSellers();
  }, []);

  const handleBooking = async (seller: Seller, slot: TimeSlot) => {
    if (!currentUser) return;

    try {
      // ✅ Use seller from arguments (not selectedSeller)
      await createAppointment(seller, currentUser, slot);

      setSelectedSeller(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Navigate to appointments tab
      navigate('/buyer/appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <div className="space-y-4">
      {sellers.map((seller) => (
        <div
          key={seller.id}
          className="p-4 bg-white rounded-md shadow flex justify-between items-center"
        >
          <div>
            <p className="font-bold">{seller.name}</p>
            <p className="text-gray-500">{seller.specialty}</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
            onClick={() => setSelectedSeller(seller)}
          >
            Book
          </button>
        </div>
      ))}

      {selectedSeller && (
        <BookingModal
          seller={selectedSeller}
          onClose={() => setSelectedSeller(null)}
          onAppointmentBooked={() => { /* This will trigger a re-fetch in BuyerDashboard */ }}
        />
      )}

      {showSuccess && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-md">
          Appointment booked successfully!
        </div>
      )}
    </div>
  );
};

export default SellerSearch;

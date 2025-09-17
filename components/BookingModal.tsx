// BookingModal.tsx
import React, { useState, useEffect } from "react";
import { Seller, TimeSlot, Availability } from "../types";
import { fetchAvailability, createAppointment } from "../services/api";
import { useAuth } from "../hooks/useAuth";

// A helper function to generate the time slots
const getAvailableTimeSlots = (
  availability: Availability | null,
  date: Date
): TimeSlot[] => {
  if (!availability) return [];

  const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase();
  if (!availability.days[dayOfWeek]) return [];

  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = availability.start_time.split(":").map(Number);
  const [endHour, endMinute] = availability.end_time.split(":").map(Number);

  const now = new Date();
  let currentSlot = new Date(date);
  currentSlot.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);

  while (currentSlot.getTime() + 30 * 60 * 1000 <= endTime.getTime()) {
    const slotEnd = new Date(currentSlot.getTime() + 30 * 60 * 1000);
    // Only add slots that are in the future
    if (slotEnd > now) {
      slots.push({ start: new Date(currentSlot), end: slotEnd });
    }
    currentSlot = slotEnd;
  }
  return slots;
};

interface BookingModalProps {
  seller: Seller;
  onClose: () => void;
  onAppointmentBooked: () => void; // Callback to refresh appointments after booking
}

const BookingModal: React.FC<BookingModalProps> = ({ seller, onClose, onAppointmentBooked }) => {
  const [sellerAvailability, setSellerAvailability] = useState<Availability | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBooking, setIsBooking] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadAvailability = async () => {
      setLoadingSlots(true);
      const avail = await fetchAvailability(seller.id);
      setSellerAvailability(avail);
      setLoadingSlots(false);
    };
    loadAvailability();
  }, [seller.id]);

  useEffect(() => {
    if (sellerAvailability) {
      const generatedSlots = getAvailableTimeSlots(sellerAvailability, selectedDate);
      setTimeSlots(generatedSlots);
    }
  }, [sellerAvailability, selectedDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
  };

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!currentUser || !currentUser.email) return alert("You must be logged in to book an appointment.");

    setIsBooking(true);
    try {
      const newAppointment = await createAppointment(
        seller,
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
        },
        slot
      );
      if (newAppointment) {
        alert("Appointment booked successfully! 🎉");
        onAppointmentBooked();
        onClose();
      } else {
        alert("Failed to book appointment. Please try again.");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Failed to book the appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full transform transition-all">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Book with {seller.name || seller.email}
            </h2>
            <p className="text-gray-600">{seller.specialty}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isBooking}
            className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed text-2xl"
          >
            &times;
          </button>
        </div>

        {/* Select Date */}
        <div className="mt-6">
          <label
            htmlFor="appointment-date"
            className="block text-sm font-medium text-gray-700"
          >
            Select a date
          </label>
          <input
            type="date"
            id="appointment-date"
            value={selectedDate.toISOString().split("T")[0]}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>

        {/* Available Slots */}
        <div className="mt-6 h-64 overflow-y-auto">
          <h3 className="font-semibold text-gray-800">Available Slots</h3>
          {loadingSlots ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : timeSlots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mt-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.start.toISOString()}
                  onClick={() => handleBookSlot(slot)}
                  disabled={isBooking}
                  className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-200 disabled:text-gray-500"
                >
                  {slot.start.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-4">
              No available slots on this day. Please select another date.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
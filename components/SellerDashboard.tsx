// SellerDashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Appointment, Availability } from "../types";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import AvailabilityEditor from "./AvailabilityEditor";
import CalendarView from "./CalendarView";
import AppointmentsList from "./AppointmentsList";
import { fetchAppointments, fetchAvailability, saveAvailability } from "../services/api";

const SellerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability | null>(null);

  const { tab } = useParams<{ tab?: string }>();
  const activeTab = tab || "dashboard";

  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    if (!currentUser) return;

    const [appts, avail] = await Promise.all([
      fetchAppointments(currentUser.id),
      fetchAvailability(currentUser.id),
    ]);
    console.log("fetching availability...");

    // Filter appointments to show only those where the current user is the seller
    const sellerAppts = appts.filter((a) => a.seller_id === currentUser.id);
    setAppointments(sellerAppts);

    if (avail) setAvailability(avail);
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ Updated: save availability to database
  const handleAvailabilitySave = async (data: Availability) => {
    if (!currentUser) return;

    try {
      const saved = await saveAvailability(data, currentUser.id);
      if (saved) {
        setAvailability(saved); // Update state with actual DB data
        alert("Availability saved successfully!");
      } else {
        alert("Failed to save availability. Try again.");
      }
    } catch (err) {
      console.error("Error saving availability:", err);
      alert("Failed to save availability. Try again.");
    }
  };
      console.log("fetching availability...");
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">My Appointments</h2>
            {appointments.length === 0 ? (
              <p>No appointments yet.</p>
            ) : (
              <ul className="space-y-4">
                {appointments.map((appt) => (
                  <li
                    key={appt.id}
                    className="border p-4 rounded-lg shadow-sm bg-white"
                  >
                    <p className="font-semibold">{appt.title}</p>
                    <p>With: {appt.buyer_name || appt.buyer_email}</p>
                    <p>
                      On: {new Date(appt.start_time).toLocaleString()} –{" "}
                      {new Date(appt.end_time).toLocaleString()}
                    </p>
                    <p>Status: {appt.status}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case "availability":
        return (
          <AvailabilityEditor
            initialAvailability={availability}
            onSave={handleAvailabilitySave} // sends data to DB
          />
        );
      case "calendar":
        return (
          <CalendarView // Pass appointments and availability as props
            appointments={appointments}
            availability={availability}
          />
        );
      default:
              console.log("fetching availability..."),
        navigate("/seller/dashboard", { replace: true });
        return null;
    }
  };

  if (!currentUser) return <p>Loading seller data...</p>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-600">
          Manage your appointments and availability.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => navigate("/seller/dashboard")}
          className={`px-6 py-3 font-semibold text-lg ${
            activeTab === "dashboard"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          My Appointments
        </button>
        <button
          onClick={() => navigate("/seller/availability")}
          className={`px-6 py-3 font-semibold text-lg ${
            activeTab === "availability"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Set Availability
        </button>
        <button
          onClick={() => navigate("/seller/calendar")}
          className={`px-6 py-3 font-semibold text-lg ${
            activeTab === "calendar"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Calendar View
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default SellerDashboard;
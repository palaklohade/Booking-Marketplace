// BuyerDashboard.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppointmentsList from "./AppointmentsList";
import SellerSearch from "./SellerSearch";
import { useAuth } from "../hooks/useAuth";
import { Appointment, Seller } from "../types";
import { fetchAppointments, fetchSellers } from "../services/api";

const BuyerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const { tab = "dashboard" } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      if (tab === "appointments") {
        const appts = await fetchAppointments(currentUser.id);
        setAppointments(appts.filter(a => a.buyer_id === currentUser.id));
      }

      if (tab === "sellers" || tab === "dashboard") {
        const sellersData = await fetchSellers();
        setSellers(sellersData);
      }
    };

    loadData();
  }, [currentUser, tab]);

  if (!currentUser) return <p>Loading user data...</p>;

  const renderTabContent = () => {
    switch (tab) {
      case "dashboard":
        return (
          <>
            <SellerSearch />
            <h2 className="text-xl font-semibold mt-6 mb-2">Available Sellers</h2>
            <ul className="list-none space-y-4">
              {sellers.map((seller) => (
                <li key={seller.id} className="p-4 border rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{seller.name}</h3>
                      <p className="text-gray-600">{seller.specialty}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/buyer/seller/${seller.id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        );
      case "appointments":
        return (
          <AppointmentsList showSellerDetails />
        );
      default:
        navigate("/buyer/dashboard", { replace: true });
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600">
          Find professionals and manage your upcoming appointments.
        </p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => navigate("/buyer/dashboard")}
          className={`px-6 py-3 font-semibold text-lg ${
            tab === "dashboard"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Book an Appointment
        </button>
        <button
          onClick={() => navigate("/buyer/appointments")}
          className={`px-6 py-3 font-semibold text-lg ${
            tab === "appointments"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          My Appointments
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default BuyerDashboard;
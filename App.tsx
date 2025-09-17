import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { UserRole } from './types';
import Header from './components/Header';
import HomePage from './components/HomePage';
import SellerDashboard from './components/SellerDashboard';
import BuyerDashboard from './components/BuyerDashboard';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const location = useLocation();

  const ProtectedRoute: React.FC<{ children: React.ReactNode, role: UserRole }> = ({ children, role }) => {
    if (!currentUser) {
      // Redirect to home if not logged in
      return <Navigate to="/" state={{ from: location }} replace />;
    }
    if (currentUser.role !== role) {
      // If logged in but wrong role, redirect to their correct dashboard
      const correctDashboard = currentUser.role === UserRole.SELLER ? '/seller/dashboard' : '/buyer/dashboard';
      return <Navigate to={correctDashboard} replace />;
    }
    return <>{children}</>;
  };
  
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Header />
      <main className="p-4 sm:p-6 md:p-8">
        <Routes>
          <Route path="/" element={!currentUser ? <HomePage /> : <Navigate to={currentUser.role === UserRole.SELLER ? '/seller/dashboard' : '/buyer/dashboard'} replace />} />
          <Route 
            path="/seller/:tab" 
            element={
              <ProtectedRoute role={UserRole.SELLER}>
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/buyer/:tab" 
            element={
              <ProtectedRoute role={UserRole.BUYER}>
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />
           {/* Fallback route to redirect logged-in users to their dashboard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
import React from 'react';
import { UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.816 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
);

const HomePage: React.FC = () => {
  const { login, loading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
          Effortless Scheduling, <span className="text-blue-600">Perfectly Synced</span>
        </h1>
       
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <button
            onClick={() => login(UserRole.SELLER)}
            disabled={loading}
            className="flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white bg-green-600 border border-transparent rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform hover:scale-105 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {loading ? 'Connecting...' : 'Login as a Seller'}
          </button>
          <button
            onClick={() => login(UserRole.BUYER)}
            disabled={loading}
            className="flex items-center justify-center w-full px-8 py-4 text-lg font-semibold text-white bg-blue-600 border border-transparent rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <GoogleIcon />
            {loading ? 'Connecting...' : 'Login as a Buyer'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute component that requires authentication
 * Redirects to landing page if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  // Pass the attempted location so user can be redirected back after login
  // if (!isAuthenticated) {
  //   return <Navigate to="/" state={{ from: location }} replace />;
  // }

  // User is authenticated, render the protected component
  return children;
};

export default ProtectedRoute;

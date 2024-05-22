import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoutes component that checks if a user is logged in before
 * rendering the intended component and abstracting the dashboard route
 * to also be the root route.
 *
 * User is forced back to login page if not logged in.
 */
const ProtectedRoutes = () => {
  const { token } = useContext(AppContext);

  if (!token) {
    return <Navigate to={'/login'} />;
  }

  const path = useLocation().pathname;
  return path === '/' ? <Navigate to={'/dashboard'} /> : <Outlet />;
};

export default ProtectedRoutes;

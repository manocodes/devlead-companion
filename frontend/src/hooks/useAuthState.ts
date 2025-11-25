import { useAuth } from '../context/AuthContext';

/**
 * Custom hook that provides authentication state and methods
 * This is a convenience wrapper around the AuthContext
 */
export const useAuthState = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    // Add computed properties
    userName: user?.name || 'Guest',
    userEmail: user?.email || '',
    isGuest: !isAuthenticated,
  };
};

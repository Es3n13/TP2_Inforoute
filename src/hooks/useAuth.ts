import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { 
  loginUser, 
  registerUser, 
  logout, 
  clearError,
  resetStatus 
} from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ username, password })).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, [dispatch]);

  const register = useCallback(async (username: string, password: string, email?: string, phone_number?: string) => {
    try {
      const result = await dispatch(registerUser({ username, password, email, phone_number})).unwrap();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, [dispatch]);

  const signOut = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetAuthStatus = useCallback(() => {
    dispatch(resetStatus());
  }, [dispatch]);

  return {
    user: auth.user,
    accessToken: auth.access,
    isAuthenticated: auth.isAuthenticated,
    status: auth.status,
    error: auth.error,
    
    login,
    register,
    logout: signOut,
    clearError: clearAuthError,
    resetStatus: resetAuthStatus,
    
    isLoading: auth.status === "loading",
    isLoggedIn: auth.isAuthenticated,
    hasError: auth.error !== null,
  };
};
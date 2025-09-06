import React, { useReducer, useEffect } from 'react';
import { AuthContext } from './AuthContextValue';
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  getStoredUser,
  AuthError
} from '../services/auth';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return { ...state, isLoading: false, error: null };

    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload?.error || null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      if (isAuthenticated()) {
        const storedUser = getStoredUser();
        if (storedUser) {
          try {
            const response = await getCurrentUser();
            if (response.success && response.user) {
              dispatch({
                type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
                payload: { user: response.user },
              });
              return;
            }
          } catch {
            dispatch({
              type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
              payload: { user: storedUser },
            });
            return;
          }
        }
      }

      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE });
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authLogin(credentials);
      
      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: response.user },
        });
        return { success: true, user: response.user };
      } else {
        const errorMessage = response.message || 'Login failed';
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: { error: errorMessage },
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof AuthError ? error.message : 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });

    try {
      const response = await authRegister(userData);
      
      if (response.success) {
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS });
        return { success: true, message: response.message };
      } else {
        const errorMessage = response.message || 'Registration failed';
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: { error: errorMessage },
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = error instanceof AuthError ? error.message : 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.REGISTER_FAILURE,
        payload: { error: errorMessage },
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch {
      // Clear state anyway
    }
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const contextValue = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

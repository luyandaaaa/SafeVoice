// useAuth.ts
import { useState, useEffect } from 'react';

interface BiometricCredentials {
  type: 'face' | 'fingerprint';
  biometricToken?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  preferredLanguage: string;
  biometricEnabled?: boolean;
}

export const useAuth = () => {
  // Initialize state from localStorage during hook creation
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));
  const [user, setUser] = useState<User | null>(() => {
    if (!storedUser) return null;
    try {
      return JSON.parse(storedUser);
    } catch (error) {
      // If stored user data is invalid, clear it
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const verifyToken = async () => {
    try {
      if (!token) {
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      const response = await fetch('http://localhost:5000/api/auth/verify', {
        method: 'GET',
        headers: {
          'x-auth-token': token,
        },
      });

      const data = await response.json();
      
      if (response.ok && data.valid) {
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Login failed');
      }

      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    preferredLanguage: string;
  }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Registration failed');
      }

      const data = await response.json();
      
      // Store token if registration includes auto-login
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsAuthenticated(true);
        setUser(data.user);
      }
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const loginWithBiometric = async (credentials: BiometricCredentials): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/biometric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || 'Biometric login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      return true;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  // Verify token validity on mount
  useEffect(() => {
    let mounted = true;
    
    const verify = async () => {
      try {
        await verifyToken();
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    verify();
    
    return () => {
      mounted = false;
    };
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
    login,
    register,
    logout,
    verifyToken,
    loginWithBiometric
  };
};
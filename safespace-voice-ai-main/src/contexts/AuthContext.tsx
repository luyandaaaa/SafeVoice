import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  mfaEnabled: boolean;
  biometricEnabled: boolean;
  preferredLanguage: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  loginWithBiometric: (type: 'face' | 'fingerprint') => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  preferredLanguage: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("safevoice_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    // Simulate API call
    try {
      // Demo user for testing
      const demoUser: User = {
        id: "demo-user",
        name: "Demo User",
        email: credentials.email,
        phone: "+27123456789",
        mfaEnabled: true,
        biometricEnabled: true,
        preferredLanguage: "en"
      };
      
      setUser(demoUser);
      localStorage.setItem("safevoice_user", JSON.stringify(demoUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const loginWithBiometric = async (type: 'face' | 'fingerprint'): Promise<boolean> => {
    try {
      // Simulate biometric authentication
      if (type === 'face' && 'navigator' in window && 'mediaDevices' in navigator) {
        // Request camera access for face authentication simulation
        await navigator.mediaDevices.getUserMedia({ video: true });
      }
      
      // Demo success
      const demoUser: User = {
        id: "demo-user-biometric",
        name: "Biometric User",
        email: "biometric@example.com",
        mfaEnabled: true,
        biometricEnabled: true,
        preferredLanguage: "en"
      };
      
      setUser(demoUser);
      localStorage.setItem("safevoice_user", JSON.stringify(demoUser));
      return true;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        mfaEnabled: false,
        biometricEnabled: false,
        preferredLanguage: userData.preferredLanguage
      };
      
      setUser(newUser);
      localStorage.setItem("safevoice_user", JSON.stringify(newUser));
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("safevoice_user");
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("safevoice_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithBiometric,
        logout,
        register,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
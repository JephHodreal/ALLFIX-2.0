import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '../services/firebaseService';
import api from '../services/apiService';

export type UserRole = 'customer' | 'vendor' | 'admin' | 'personnel';

interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  isAuthenticated: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const profileLoadedRef = React.useRef(false);

  const fetchProfile = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await api.get('/api/auth/me');
        const data = response.data;
        setProfile(data);
        setRole(data.role);
        profileLoadedRef.current = true;
        return data;
      } catch (error) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, 500 * (i + 1)));
          continue;
        }
        setProfile(null);
        setRole(null);
        profileLoadedRef.current = false;
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && firebaseUser.emailVerified) {
        await fetchProfile();
      } else {
        setProfile(null);
        setRole(null);
        profileLoadedRef.current = false;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    return await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        isAuthenticated: !!user && !!profile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

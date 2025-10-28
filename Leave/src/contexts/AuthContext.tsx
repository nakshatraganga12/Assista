import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/database';
import * as storage from '../lib/storage';

interface AuthContextType {
  user: User | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = storage.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = storage.signIn(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    setUser(user);
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const newUser = storage.signUp(email, password, userData);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    storage.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile: user, // Same as user in this local storage implementation
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
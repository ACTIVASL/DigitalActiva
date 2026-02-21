import React, { createContext, useContext } from 'react';

type UserRole = 'admin' | 'therapist';

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  canDelete: boolean;
  canViewFinancials: boolean;
  canEditConfig: boolean;
  subscriptionStatus: 'free' | 'premium';
  isPremium: boolean;
  upgradeToPremium: () => void; // For demo purposes
  user: User | null; // Typed strongly via Firebase Auth
  loading: boolean;
}

import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@monorepo/engine-auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { useFirebaseAuthState } from '@monorepo/engine-auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useFirebaseAuthState();

  // Role from Firestore user profile (default: therapist)
  const [role, setRole] = React.useState<UserRole>('therapist');

  // Fetch role from Firestore when user changes
  React.useEffect(() => {
    if (!auth.user) {
      setRole('therapist');
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', auth.user.uid), (snap) => {
      const data = snap.data();
      const userRole = data?.role as UserRole | undefined;
      setRole(userRole === 'admin' ? 'admin' : 'therapist');
    });
    return unsub;
  }, [auth.user]);

  const isAuthenticated = !!auth.user;
  const isPremium = auth.isPremium;
  const subscriptionStatus = isPremium ? 'premium' : 'free';

  const login = (newRole: UserRole) => {
    setRole(newRole);
  };

  const logout = () => {
    auth.signOut();
  };

  const upgradeToPremium = () => {
    // In production, redirect to Stripe/payment flow
  };

  // RBAC LOGIC
  const canDelete = role === 'admin';
  const canViewFinancials = role === 'admin';
  const canEditConfig = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated,
        login,
        logout,
        canDelete,
        canViewFinancials,
        canEditConfig,
        subscriptionStatus,
        isPremium,
        upgradeToPremium,
        user: auth.user,
        loading: auth.loading, // EXPOSE LOADING
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

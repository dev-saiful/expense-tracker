import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { GET_AUTH_USER } from '@/graphql/user';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: any;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { data, loading, error, refetch } = useQuery(GET_AUTH_USER, {
    errorPolicy: 'ignore',
    fetchPolicy: 'cache-and-network', // Always check server for latest data
    notifyOnNetworkStatusChange: true, // Re-render when network status changes
    // Add retry for network errors
    onError: (error) => {
      console.log('Auth query error:', error);
    },
  });

  const value = {
    user: data?.authUser || null,
    loading,
    error,
    refetch: async () => {
      try {
        const result = await refetch();
        return result;
      } catch (error) {
        console.log('Auth refetch error:', error);
        return null;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

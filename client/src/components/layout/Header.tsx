import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useMutation } from '@apollo/client';
import { LOGOUT, GET_AUTH_USER } from '@/graphql/user';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { apolloClient } from '@/lib/apollo';
import {
  Home,
  PlusCircle,
  BarChart3,
  User,
  LogOut,
  DollarSign,
} from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logout, { loading }] = useMutation(LOGOUT, {
    refetchQueries: [{ query: GET_AUTH_USER }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      // Clear Apollo Client cache to remove all cached data
      apolloClient.clearStore();
      // Navigate to login page
      navigate('/login');
    },
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear client cache and redirect
      apolloClient.clearStore();
      navigate('/login');
    }
  };

  if (!user) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Add Transaction', href: '/add-transaction', icon: PlusCircle },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2">
            <DollarSign className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              ExpenseTracker
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              loading={loading}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

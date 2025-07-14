import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { LOGIN, GET_AUTH_USER } from '@/graphql/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { LoginInput } from '@/types';
import { DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { refetch } = useAuth();

  const [login, { loading }] = useMutation(LOGIN, {
    refetchQueries: [{ query: GET_AUTH_USER }],
    awaitRefetchQueries: true,
    onCompleted: async () => {
      // Force refetch of auth user to sync the context
      await refetch();
      // Small delay to ensure cache is updated
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    try {
      setError('');
      // Perform login mutation
      await login({ variables: { input: data } });
      // Navigation is handled in onCompleted callback
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <DollarSign className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Input
              label="Username"
              type="text"
              {...register('username', { required: 'Username is required' })}
              error={errors.username?.message}
              placeholder="Enter your username"
            />

            <Input
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
              placeholder="Enter your password"
            />

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { SIGN_UP, GET_AUTH_USER } from '@/graphql/user';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Card } from '@/components/ui';
import { SignUpInput } from '@/types';
import { DollarSign } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [error, setError] = useState('');

  const [signUp, { loading }] = useMutation(SIGN_UP, {
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
  } = useForm<SignUpInput>();

  const onSubmit = async (data: SignUpInput) => {
    try {
      setError('');
      await signUp({ variables: { input: data } });
      // Navigation is handled in onCompleted callback
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    }
  };

  const genderOptions = [
    { value: '', label: 'Select gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <DollarSign className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
          <p className="mt-2 text-gray-600">
            Start tracking your expenses today
          </p>
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
              placeholder="Choose a username"
            />

            <Input
              label="Full Name"
              type="text"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
              placeholder="Enter your full name"
            />

            <Input
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={errors.password?.message}
              placeholder="Create a password"
            />

            <Select
              label="Gender"
              options={genderOptions}
              {...register('gender', { required: 'Gender is required' })}
              error={errors.gender?.message}
            />

            <Button type="submit" className="w-full" loading={loading}>
              Create account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

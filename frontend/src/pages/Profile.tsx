import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { CameraIcon } from '@heroicons/react/24/outline';
import { api } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import toast from 'react-hot-toast';
import type { AuthUser } from '../types/auth.types';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export function Profile() {
  const { user } = useAuth();
  const { updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');

  const {
    register: registerProfile,
    handleSubmit: handleProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (values: ProfileValues) =>
      api.patch<AuthUser>('/users/me', values).then((r) => r.data),
    onSuccess: (data) => {
      updateUser(data);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (values: PasswordValues) =>
      api.post('/auth/change-password', values).then((r) => r.data),
    onSuccess: () => {
      toast.success('Password changed!');
      resetPassword();
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message ?? 'Failed to change password');
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('avatar', file);
      return api.post<{ avatarUrl: string }>('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data);
    },
    onSuccess: (data) => {
      updateUser({ avatarUrl: data.avatarUrl });
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) avatarMutation.mutate(file);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">My Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 p-5 bg-surface-50 rounded-2xl border border-surface-100">
        <div className="relative">
          <Avatar src={user?.avatarUrl ?? undefined} name={`${user?.firstName} ${user?.lastName}`} size="lg" />
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
            <CameraIcon className="w-3.5 h-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </label>
        </div>
        <div>
          <p className="font-bold text-surface-900">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-surface-500">{user?.email}</p>
          <p className="text-xs text-surface-400 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-200">
        {(['profile', 'password'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary-500 text-primary-700'
                : 'border-transparent text-surface-600 hover:text-surface-900'
            }`}
          >
            {tab === 'password' ? 'Change Password' : 'Edit Profile'}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleProfile((v) => profileMutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              {...registerProfile('firstName')}
              error={profileErrors.firstName?.message}
            />
            <Input
              label="Last Name"
              {...registerProfile('lastName')}
              error={profileErrors.lastName?.message}
            />
          </div>
          <Input
            label="Phone Number"
            type="tel"
            {...registerProfile('phone')}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Email Address</label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm bg-surface-50 text-surface-500 cursor-not-allowed"
            />
            <p className="text-xs text-surface-400 mt-1">Email cannot be changed.</p>
          </div>
          <Button type="submit" isLoading={profileMutation.isPending}>
            Save Changes
          </Button>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePassword((v) => passwordMutation.mutate(v))} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            {...registerPassword('currentPassword')}
            error={passwordErrors.currentPassword?.message}
          />
          <Input
            label="New Password"
            type="password"
            {...registerPassword('newPassword')}
            error={passwordErrors.newPassword?.message}
          />
          <Input
            label="Confirm New Password"
            type="password"
            {...registerPassword('confirmPassword')}
            error={passwordErrors.confirmPassword?.message}
          />
          <Button type="submit" isLoading={passwordMutation.isPending}>
            Change Password
          </Button>
        </form>
      )}
    </div>
  );
}

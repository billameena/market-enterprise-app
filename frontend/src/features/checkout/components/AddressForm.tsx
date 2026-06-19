import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../utils/api';
import { Input } from '../../../components/ui/Input';
import type { UserAddress } from '../../../types/user.types';

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Valid phone number required'),
  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  onSubmit: (values: AddressFormValues) => void;
  isLoading?: boolean;
}

export function AddressForm({ onSubmit }: AddressFormProps) {
  const { data: addresses } = useQuery({
    queryKey: ['user-addresses'],
    queryFn: () =>
      api.get<UserAddress[]>('/users/me/addresses').then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'US',
    },
  });

  function loadSavedAddress(address: UserAddress) {
    reset({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone ?? '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
  }

  return (
    <div className="space-y-6">
      {/* Saved addresses */}
      {addresses && addresses.length > 0 && (
        <div>
          <p className="text-sm font-medium text-surface-700 mb-2">Use a saved address</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                type="button"
                onClick={() => loadSavedAddress(addr)}
                className="text-left p-3 rounded-xl border border-surface-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
              >
                <p className="text-sm font-medium text-surface-900">
                  {addr.firstName} {addr.lastName}
                </p>
                <p className="text-xs text-surface-500 mt-0.5">{addr.addressLine1}, {addr.city}</p>
              </button>
            ))}
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-surface-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-2 text-xs text-surface-400">or enter new address</span></div>
          </div>
        </div>
      )}

      <form id="address-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            {...register('firstName')}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name"
            {...register('lastName')}
            error={errors.lastName?.message}
          />
        </div>

        <Input
          label="Phone Number"
          type="tel"
          {...register('phone')}
          error={errors.phone?.message}
        />

        <Input
          label="Address Line 1"
          {...register('addressLine1')}
          placeholder="123 Main Street"
          error={errors.addressLine1?.message}
        />

        <Input
          label="Address Line 2 (optional)"
          {...register('addressLine2')}
          placeholder="Apt, Suite, Unit"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="City" {...register('city')} error={errors.city?.message} />
          <Input label="State / Province" {...register('state')} error={errors.state?.message} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Postal Code"
            {...register('postalCode')}
            error={errors.postalCode?.message}
          />
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1.5">Country</label>
            <select
              {...register('country')}
              className="w-full px-3 py-2.5 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="IN">India</option>
            </select>
            {errors.country && (
              <p className="text-xs text-danger-600 mt-1">{errors.country.message}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

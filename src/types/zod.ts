import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    auth_provider: z.string().min(1, 'Auth provider is required'),
    auth_provider_id: z.string().min(1, 'Auth provider ID is required'),
    avatar_url: z.string().url().nullable().optional(),
});

export const createVendorSchema = z.object({
    name: z.string().min(1, 'Vendor name is required'),
    email: z.string().email('Invalid email'),
});
export const updateVendorSchema = createVendorSchema.partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

import { z } from 'zod';

export const vinSchema = z
  .string()
  .min(1, 'VIN number is required')
  .length(17, 'VIN must be exactly 17 characters')
  .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Invalid VIN format. Must not contain letters I, O, or Q.');

export const quoteFormSchema = z.object({
  vin: z
    .string()
    .transform((val) => val.trim().toUpperCase())
    .refine((val) => val === '' || (val.length === 17 && !/[IOQ]/.test(val)), {
      message: 'VIN must be 17 characters without letters I, O, or Q',
    }),
  make: z.string().min(1, 'Please select vehicle make'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z
    .string()
    .min(4, 'Year must be 4 digits')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 1980 && num <= 2026;
    }, 'Enter a valid year between 1980 and 2026'),
  engine: z.string().optional(),
  partDescription: z
    .string()
    .min(8, 'Please describe the part in at least 8 characters'),
  conditionPref: z.enum(['any', 'new', 'used', 'refurbished']),
  urgency: z.enum(['urgent', 'standard', 'planning']),
  fullName: z.string().min(2, 'Full name is required'),
  whatsappNumber: z
    .string()
    .min(10, 'Enter a valid 10-digit South African cell number')
    .regex(/^(\+27|0)[6-8][0-9]{8}$/, 'Valid SA mobile number required (e.g. 0821234567)'),
  email: z.string().email('Enter a valid email address'),
  cityProvince: z.string().min(1, 'Select your location'),
});

export type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export const checkoutFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .min(10, 'Valid SA phone number required')
    .regex(/^(\+27|0)[6-8][0-9]{8}$/, 'Valid SA mobile number required'),
  streetAddress: z.string().min(5, 'Street address is required'),
  suburb: z.string().min(2, 'Suburb is required'),
  city: z.string().min(2, 'City/Metro is required'),
  province: z.string().min(2, 'Province is required'),
  postalCode: z.string().regex(/^\d{4}$/, 'SA Postal code must be 4 digits'),
  courierOption: z.enum(['courier_guy', 'ram', 'pargo']),
  paymentMethod: z.enum(['payfast', 'ozow', 'card', 'quote']),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

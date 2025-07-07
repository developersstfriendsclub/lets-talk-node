import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  name: z.string().min(1, { message: 'Name is required' }),
  gender: z.enum(['male', 'female', 'other'], { message: 'Invalid gender' }),
  phone: z.string().regex(/^[0-9]{10}$/, { message: 'Phone must be 10 digits' }),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'DOB must be YYYY-MM-DD' }),
});

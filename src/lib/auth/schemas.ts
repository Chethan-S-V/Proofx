import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = loginSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters").optional(),
  lastName: z.string().trim().optional(),
});

export const passwordResetSchema = z.object({ token: z.string().min(32), password: z.string().min(12, "Password must be at least 12 characters").regex(/[A-Z]/, "Include an uppercase letter").regex(/[a-z]/, "Include a lowercase letter").regex(/[0-9]/, "Include a number") });
export const passwordChangeSchema = z.object({ currentPassword: z.string().min(8), password: z.string().min(12, "Password must be at least 12 characters").regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/) });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

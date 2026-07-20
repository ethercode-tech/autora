import { z } from "zod";

export const onboardingSchema = z.object({
  businessName: z.string().min(2),
  currency: z.string().min(3).max(3),
  businessType: z.enum(["manufacturer", "reseller"]),
  timezone: z.string().min(3)
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

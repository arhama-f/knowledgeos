import { z } from "zod";

export const orgSettingsSchema = z.object({
  llm_provider: z.enum(["openai", "anthropic", "gemini"]),
  llm_model: z.string().min(1, "Model is required"),
});
export type OrgSettingsInput = z.infer<typeof orgSettingsSchema>;

export const apiKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Keep it under 100 characters"),
});
export type ApiKeyInput = z.infer<typeof apiKeySchema>;

export const brandingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logo_url: z.union([z.string().url("Must be a valid URL"), z.literal("")]),
  primary_color: z
    .string()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use a hex color like #4F46E5")
    .or(z.literal("")),
  website_url: z.union([z.string().url("Must be a valid URL"), z.literal("")]),
});
export type BrandingInput = z.infer<typeof brandingSchema>;

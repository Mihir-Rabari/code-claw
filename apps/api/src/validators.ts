import { z } from 'zod';

export const ReviewInputSchema = z.object({
  installationId: z.number().int().positive(),
  owner: z.string().min(1),
  repo: z.string().min(1),
  prNumber: z.number().int().positive(),
});

export type ReviewInput = z.infer<typeof ReviewInputSchema>;

export const ObservationSchema = z.object({
  pattern: z.string().min(1),
  evidence: z.array(
    z.object({
      prNumber: z.number().int().positive(),
      description: z.string().min(1),
    }),
  ),
});

export type Observation = z.infer<typeof ObservationSchema>;

export function parseReviewInput(raw: unknown): ReviewInput {
  return ReviewInputSchema.parse(raw);
}

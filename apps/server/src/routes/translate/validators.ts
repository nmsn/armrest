import { z } from 'zod';

export const translateBodySchema = z.object({
  text: z.string().trim().min(1),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const translateQuerySchema = z.object({
  text: z.string().trim().min(1).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

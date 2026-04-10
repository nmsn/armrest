import { z } from 'zod';

export const syncBodySchema = z.object({
  bookmarks: z.array(z.object({
    id: z.string().optional(),
    folderId: z.string(),
    name: z.string().min(1),
    url: z.string().url(),
    logo: z.string().optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    position: z.number().optional(),
  })),
});

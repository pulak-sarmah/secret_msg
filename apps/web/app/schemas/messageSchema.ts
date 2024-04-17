import { z } from 'zod'

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: 'Message must atleat 10 charecter' })
    .max(300, { message: 'Message must be at most 300 charecter' }),

  username: z.string(),
})

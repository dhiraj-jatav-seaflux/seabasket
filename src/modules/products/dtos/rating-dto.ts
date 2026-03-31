import { z } from "zod";

export const RatingDTO = z.object({
  comment: z
    .string()
    .trim()
    .max(500, "Comment must be less than 500 characters")
    .optional(),

  rating: z
    .coerce.number()
    .min(1)
    .max(5)
    .refine((val) => Number.isInteger(val * 10), {
      message: "Rating must be in steps of 0.1",
    })
    .default(1),
});

export type TRatingDTO = z.infer<typeof RatingDTO>;
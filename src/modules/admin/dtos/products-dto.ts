import { z } from "zod";

export const ProductDTO = z.object({
  name: z.string().trim().min(1, "Product name cannot be empty").max(100),
  categoryId: z.coerce.number(),
  description: z.string().trim().optional(),
  price: z.coerce.number().positive(),
  discount: z.coerce.number().min(0).default(0),
  stock: z.coerce.number().int().nonnegative(),
  isTrending: z.coerce.boolean().default(false),
});

export type TProductDTO = z.infer<typeof ProductDTO>;
import { z } from "zod";

export const CategoryDTO = z.object({
  categoryName: z.string().trim().min(1, "Category name cannot be empty")
});

export type TCategoryDTO = z.infer<typeof CategoryDTO>;
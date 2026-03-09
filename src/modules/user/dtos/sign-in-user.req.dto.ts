import { z } from "zod";

export const SignInUserDTO = z.object({
  login: z.string(),
  password: z.string().min(8),
});

export type TSignInUserDTO = z.infer<typeof SignInUserDTO>; 
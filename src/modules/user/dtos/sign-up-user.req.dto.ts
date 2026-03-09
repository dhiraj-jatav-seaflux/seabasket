import { z } from "zod";

export const SignUpUserDTO = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  phone:z.string().max(15),
  address:z.string().nonempty(),
  city:z.string().nonempty(),
  pincode:z.string().max(6),
  state:z.string().nonempty()
});

export type TSignUpUserDTO = z.infer<typeof SignUpUserDTO>;

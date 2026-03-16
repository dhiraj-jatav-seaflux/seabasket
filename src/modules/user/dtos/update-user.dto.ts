import {z} from "zod"

export const UpdateUserDTO = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.email(),
  phone:z.string().max(15),
  address:z.string().nonempty(),
  city:z.string().nonempty(),
  pincode:z.string().max(6),
  state:z.string().nonempty()
})

export type TUpdateUserDTO = z.infer<typeof UpdateUserDTO>
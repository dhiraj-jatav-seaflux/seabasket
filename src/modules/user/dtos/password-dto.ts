import {z} from "zod";

export const PasswordDTO = z.object({
    password: z.string().min(8),
    token:z.string().nonempty(),
})

export type TPasswordDTO = z.infer<typeof PasswordDTO>
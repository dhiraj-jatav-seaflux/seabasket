import {z} from "zod";

export const PasswordDTO = z.object({
    password: z.string().min(8)
})

export type TPasswordDTO = z.infer<typeof PasswordDTO>
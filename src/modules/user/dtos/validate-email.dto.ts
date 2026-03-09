import {z} from "zod";

export const EmailUserDTO = z.object({
    email:z.email()
})

export type TEmailUserDTO = z.infer<typeof EmailUserDTO>;
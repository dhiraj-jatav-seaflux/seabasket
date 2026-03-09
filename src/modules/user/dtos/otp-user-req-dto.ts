import {z} from "zod";

export const OTPUserDTO = z.object({
    otp:z.string().length(6)
})

export type TOTPUserDTO = z.infer<typeof OTPUserDTO>;
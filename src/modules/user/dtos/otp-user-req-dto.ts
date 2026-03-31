import {z} from "zod";

export const OTPUserDTO = z.object({
    otp: z.string().length(6),
    cartItems: z.array(
        z.object({
        id: z.number(),
        quantity: z.number()
        })
    ).optional()
})

export type TOTPUserDTO = z.infer<typeof OTPUserDTO>;
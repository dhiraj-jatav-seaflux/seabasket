import { PaymentMode } from "@types";
import { z } from "zod";

export const OrderDTO = z.object({
  isSingle: z.boolean().default(false),

  productId: z.number().optional(),

  address: z
    .string()
    .trim()
    .min(5, "Address is too short"),
  
    city: z.string().trim().nonempty(),
    pincode:z.string().length(6).nonempty(),
    state: z.string().trim().nonempty(),

  paymentMode: z.nativeEnum(PaymentMode).default(PaymentMode.COD),
})
.superRefine((data, ctx) => {
  if (data.isSingle && !data.productId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "productId is required when isSingle is true",
      path: ["productId"],
    });
  }

  if (!data.isSingle && data.productId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "productId should not be provided when ordering from cart",
      path: ["productId"],
    });
  }
});

export type TOrderDTO = z.infer<typeof OrderDTO>;
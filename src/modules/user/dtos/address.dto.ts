import {z} from "zod";

export const AddressDTO = z.object({
    address:z.string().nonempty(),
    city:z.string().nonempty(),
    pincode:z.string().nonempty(),
    state:z.string().nonempty(),
})

export type TAddressDTO = z.infer<typeof AddressDTO>
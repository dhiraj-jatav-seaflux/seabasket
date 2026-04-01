import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { addAddress, deleteAddress, updateAddress } from "../user.controller";
import { AddressDTO } from "../dtos";


const routes = (app:Router)=>{
    app.post('/',acl,bodyValidator(AddressDTO),addAddress)
    app.put('/:addressId',acl,bodyValidator(AddressDTO),updateAddress);
    app.delete('/:addressId',acl,deleteAddress);
}

export const addressRoutes = withRoutes(routes);
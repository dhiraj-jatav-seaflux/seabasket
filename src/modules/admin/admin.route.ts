import { withRoutes } from "@helpers";
import { Router } from "express";
import {createProduct, deleteProduct, postCategory, uploadProductImage } from "./admin.controller";
import { acl, adminAcl, bodyValidator, upload } from "@middlewares";
import { CategoryDTO, ProductDTO } from "./dtos";


const routes = (app:Router)=>{
    app.post("/categories",adminAcl,bodyValidator(CategoryDTO),postCategory);
    app.post('/products',adminAcl,bodyValidator(ProductDTO),createProduct);
    app.post('/products/:productId/images',adminAcl,upload.array("images",5),uploadProductImage)
    app.delete('/products/:productId',adminAcl,deleteProduct)
};

export const adminRoutes = withRoutes(routes)
import { withRoutes } from "@helpers";
import { Router } from "express";
import {createProduct, deleteProduct, postCategory, uploadProductImage } from "./admin.controller";
import { acl, bodyValidator, upload } from "@middlewares";
import { CategoryDTO, ProductDTO } from "./dtos";


const routes = (app:Router)=>{
    app.post("/categories",bodyValidator(CategoryDTO),acl,postCategory);
    app.post('/products',bodyValidator(ProductDTO),acl,createProduct);
    app.post('/products/:productId/images',acl,upload.array("images",5),uploadProductImage)
    app.delete('/products/:productId',acl,deleteProduct)
};

export const adminRoutes = withRoutes(routes)
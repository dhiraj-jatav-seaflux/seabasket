import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { RatingDTO } from "../dtos";
import { addReview, deleteReview, updateReview } from "../products.controller";

const routes = (app:Router)=>{
    app.post("/:productId",acl,bodyValidator(RatingDTO),addReview);
    app.put('/:reviewId',acl,bodyValidator(RatingDTO),updateReview);
    app.delete('/:reviewId',acl,deleteReview);
}

export const reviewRoutes = withRoutes(routes)
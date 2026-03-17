import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { EmailUserDTO, OTPUserDTO, PasswordDTO, RatingDTO, SignInUserDTO, SignUpUserDTO } from "./dtos";
import { addReview, forgotPassword, getUser, resendOtp, resetPassword, signInUser, signUpUser, updateUser, verifyLoginOtp } from "./user.controller";
import { UpdateUserDTO } from "./dtos/update-user.dto";

const routes = (app: Router) => {
  app.post("/sign-up", bodyValidator(SignUpUserDTO), signUpUser);
  app.post("/sign-in", bodyValidator(SignInUserDTO), signInUser);
  app.get("/me", acl, getUser);
  app.post('/verify-login-otp',bodyValidator(OTPUserDTO),verifyLoginOtp);
  app.post("/forgot-password",bodyValidator(EmailUserDTO),forgotPassword);
  app.post("/reset-password",bodyValidator(PasswordDTO),resetPassword);
  app.put("/update",acl,bodyValidator(UpdateUserDTO),updateUser);
  app.post("/review/:productId",acl,bodyValidator(RatingDTO),addReview);
  app.post("/resend-otp",resendOtp)
};

export const userRoutes = withRoutes(routes);
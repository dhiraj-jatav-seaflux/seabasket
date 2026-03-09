import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { EmailUserDTO, OTPUserDTO, PasswordDTO, SignInUserDTO, SignUpUserDTO } from "./dtos";
import { forgotPassword, getUser, resetPassword, signInUser, signUpUser, updateUser, verifyLoginOtp } from "./user.controller";

const routes = (app: Router) => {
  app.post("/sign-up", bodyValidator(SignUpUserDTO), signUpUser);
  app.post("/sign-in", bodyValidator(SignInUserDTO), signInUser);
  app.get("/me", acl, getUser);
  app.post('/verify-login-otp',bodyValidator(OTPUserDTO),verifyLoginOtp);
  app.post("/forgot-password",bodyValidator(EmailUserDTO),forgotPassword);
  app.post("/reset-password",bodyValidator(PasswordDTO),resetPassword);
  app.put("/update/:userId",acl,bodyValidator(SignUpUserDTO),updateUser)
};

export const userRoutes = withRoutes(routes);
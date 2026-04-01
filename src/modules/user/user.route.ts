import { withRoutes } from "@helpers";
import { acl, bodyValidator } from "@middlewares";
import { Router } from "express";
import { EmailUserDTO, OTPUserDTO, PasswordDTO, SignInUserDTO, SignUpUserDTO } from "./dtos";
import { forgotPassword, getUser, resendOtp, resetPassword, signInUser, signUpUser, updateUser, verifyLoginOtp } from "./user.controller";
import { UpdateUserDTO } from "./dtos/update-user.dto";
import { addressRoutes } from "./address";

const routes = (app: Router) => {
  app.post("/sign-up", bodyValidator(SignUpUserDTO), signUpUser);
  app.post("/sign-in", bodyValidator(SignInUserDTO), signInUser);
  app.get("/me", acl, getUser);
  app.post('/verify-otp',bodyValidator(OTPUserDTO),verifyLoginOtp);
  app.post("/forgot-password",bodyValidator(EmailUserDTO),forgotPassword);
  app.post("/reset-password",bodyValidator(PasswordDTO),resetPassword);
  app.put("/user",acl,bodyValidator(UpdateUserDTO),updateUser);
  app.post("/resend-otp",resendOtp)
  app.use('/address',addressRoutes)
};

export const userRoutes = withRoutes(routes);
import { ProductsEntity, ReviewsEntity, UserEntity } from "@entities";
import {
  encode,
  decode,
  generateOTP,
  getRepo,
  hashPassword,
  sendResetEmail,
  verifyPassword,
} from "@helpers";
import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import { TSignInUserDTO, TSignUpUserDTO } from "./dtos";
import { sendEmail } from "@helpers";

export async function signUpUser(
  req: TRequest<TSignUpUserDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      address,
      city,
      pincode,
      state,
    } = req.dto;
    const userRepository = getRepo(UserEntity);

    const existingUser = await userRepository.findOne({
      where: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists please login",
      });
    }

    const hasedPassword = await hashPassword(password);

    const user = userRepository.create({
      first_name,
      last_name,
      email,
      password: hasedPassword,
      phone,
      address,
      city,
      pincode,
      state,
    });

    const otp = generateOTP();
    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    user.login_otp = otp;
    user.login_otp_expiration = expiration;

    await userRepository.save(user);

    sendEmail(user.email, otp).catch(console.error);

    const token = encode({ id: user.id });

    res.status(200).json({
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function signInUser(
  req: TRequest<TSignInUserDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { login, password } = req.dto;
    const userRepository = getRepo(UserEntity);

    const isEmail = login.includes("@");

    const user = await userRepository.findOne({
      where: isEmail ? { email: login } : { phone: login },
    });

    if (!user) {
      return next({ status: 400, message: "User not found" });
    }

    const compare = await verifyPassword(password, user.password);

    if (!compare) {
      return next({ status: 400, message: "Invalid credentials" });
    }

    const otp = generateOTP();

    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    user.login_otp = otp;
    user.login_otp_expiration = expiration;

    await userRepository.save(user);

    sendEmail(user.email, otp).catch(console.error);

    const token = encode({
      id: user.id,
    });

    res.status(200).json({
      message: "OTP sent to your email",
      token: token,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyLoginOtp(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next({ status: 401, message: "Token missing" });
    }

    const decoded = decode<{ id: number }>(token);

    if (!decoded) {
      return next({ status: 401, message: "Invalid token" });
    }

    const userRepository = getRepo(UserEntity);

    const user = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return next({ status: 400, message: "User not found" });
    }

    if (user.login_otp !== otp) {
      return next({ status: 400, message: "Invalid OTP" });
    }

    if (new Date() > user.login_otp_expiration) {
      return next({ status: 400, message: "OTP expired" });
    }

    user.login_otp = null;
    user.login_otp_expiration = null;

    await userRepository.save(user);

    res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        token: encode({ id: user.id, email: user.email, role: user.role }),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resendOtp(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next({ status: 401, message: "Token missing" });
    }
    const decoded = decode<{ id: number }>(token);

    if (!decoded) {
      return next({ status: 401, message: "Invalid token" });
    }

    const userRepository = getRepo(UserEntity);

    const user = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return next({ status: 400, message: "User not found" });
    }

    const otp = generateOTP();
    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    user.login_otp = otp;
    user.login_otp_expiration = expiration;

    await userRepository.save(user);

    sendEmail(user.email, otp).catch(console.error);

    const newToken = encode({
      id: user.id,
    });

    res.status(200).json({
      message: "OTP sent to your email",
      token: newToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  const { email } = req.body;
  const userRepository = getRepo(UserEntity);

  try {
    const user = await userRepository.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const token = encode({ id: user.id });

    user.reset_token = token;

    user.reset_token_expiration = new Date(Date.now() + 60 * 60 * 1000);

    await userRepository.save(user);

    sendResetEmail(user.email, token).catch(console.error);

    res
      .status(200)
      .json({ message: "Reset password link is sent to your email" });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  const { token } = req.params;
  const { password } = req.body;

  const userRepository = getRepo(UserEntity);

  try {
    const user = await userRepository.findOne({
      where: { reset_token: token },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    if (user.reset_token_expiration < new Date()) {
      return res.status(400).json({ message: "Reset token expired" });
    }

    user.password = await hashPassword(password);

    user.reset_token = null;
    user.reset_token_expiration = null;

    await userRepository.save(user);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getUser(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const {
      id,
      first_name,
      last_name,
      email,
      phone,
      address,
      city,
      pincode,
      state,
    } = req.me;
    res.status(200).json({
      data: {
        id,
        first_name,
        last_name,
        email,
        phone,
        address,
        city,
        pincode,
        state,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  const { userId } = req.params;
  const {
    first_name,
    last_name,
    email,
    password,
    phone,
    address,
    city,
    pincode,
    state,
  } = req.dto;

  try {
    const userRepository = getRepo(UserEntity);

    const user = await userRepository.findOne({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    user.first_name = first_name;
    user.last_name = last_name;
    user.address = address;
    user.city = city;
    user.email = email;
    user.password = password;
    user.pincode = pincode;
    user.phone = phone;
    user.state = state;

    await userRepository.save(user);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function addReview(
  req: TRequest,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const productId = Number(req.params.productId);
    const { id } = req.me;

    const { comment } = req.body;
    const { rating } = req.body;

    const productRepo = getRepo(ProductsEntity);
    const product = await productRepo.findOne({
      where: { id: productId },
    });

    const reviewsRepo = getRepo(ReviewsEntity);

    if (!product) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    const alreadyReviewed = await reviewsRepo.findOne({
      where: {
        id: productId,
        user_id: id,
      },
    });

    if (alreadyReviewed) {
      return res
        .status(409)
        .json({ message: "Review already added for this product" });
    }

    const review = reviewsRepo.create({
      product_id: productId,
      user_id: id,
      rating: rating,
      comment,
    });

    await reviewsRepo.save(review);

    res.status(200).json({ message: "Review added", review: review });
  } catch (error) {
    next(error);
  }
}

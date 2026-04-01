import {
  CartsEntity,
  ProductsEntity,
  UserEntity,
} from "@entities";
import {
  encode,
  decode,
  generateOTP,
  getRepo,
  hashPassword,
  sendResetEmail,
  verifyPassword,
  validatePhoneNumber,
} from "@helpers";
import { TRequest, TResponse } from "@types";
import { NextFunction } from "express";
import { TAddressDTO, TEmailUserDTO, TOTPUserDTO, TPasswordDTO, TSignInUserDTO, TSignUpUserDTO,TUpdateUserDTO } from "./dtos";
import { sendEmail } from "@helpers";
import { CartItemsEntity } from "db/entities/cart-items.entity";
import { AddressesEntity } from "db/entities/addresses.entity";

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
    const addRepository = getRepo(AddressesEntity);

    if(!validatePhoneNumber(phone)){
      return res.status(400).json({message:'Invalid phone number'})
    }

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
      // address,
      // city,
      // pincode,
      // state,
    });

    const otp = generateOTP();
    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    user.login_otp = otp;
    user.login_otp_expiration = expiration;

    await userRepository.save(user);

    const userAddress = addRepository.create({
      user_id:user.id,
      address,
      city,
      pincode,
      state,
    })

    await addRepository.save(userAddress);

    await sendEmail(user.email, otp);

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

    await sendEmail(user.email, otp);

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
  req: TRequest<TOTPUserDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { otp, cartItems } = req.dto;
    const token = req.headers.authorization?.split(" ")[1];

    const cartsRepo = getRepo(CartsEntity);
    const cartItemsRepo = getRepo(CartItemsEntity);
    const productsRepo = getRepo(ProductsEntity);

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
      return next({ status: 404, message: "User not found" });
    }

    if (user.login_otp !== otp) {
      return next({ status: 400, message: "Invalid OTP" });
    }

    if (new Date() > user.login_otp_expiration) {
      return next({ status: 400, message: "OTP expired" });
    }

    if (cartItems && cartItems.length > 0) {
      const userCart = await cartsRepo.findOne({
        where: { user_id: user.id },
      });

      if (!userCart) {
        const cart = cartsRepo.create({
          user_id: user.id,
        });

        await cartsRepo.save(cart);

        for (const data of cartItems) {
          const product = await productsRepo.findOne({
            where: { id: data.id },
          });

          if (!product) continue;

          const cartItem = cartItemsRepo.create({
            cart_id: cart.id,
            product_id: product.id,
            quantity: data.quantity,
          });

          await cartItemsRepo.save(cartItem);
        }
      } else {
        for (const data of cartItems) {
          const product = await productsRepo.findOne({
            where: { id: data.id },
          });

          if (!product) continue;

          const existingCartItem = await cartItemsRepo.findOne({
            where: {
              cart_id: userCart.id,
              product_id: product.id,
            },
          });

          if (existingCartItem) {
            existingCartItem.quantity += data.quantity;
            await cartItemsRepo.save(existingCartItem);
          } else {
            const newCartItem = cartItemsRepo.create({
              cart_id: userCart.id,
              product_id: product.id,
              quantity: data.quantity,
            });

            await cartItemsRepo.save(newCartItem);
          }
        }
      }
    }

    user.login_otp = null;
    user.login_otp_expiration = null;

    await userRepository.save(user);

    res.status(200).json({
      data: {
        id: user.id,
        email: user.email,
        token: encode({ id: user.id, email: user.email, role: user.role, message:process.env.TOKEN_SECRET_MESSAGE}),
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
      return next({ status: 404, message: "User not found" });
    }

    const otp = generateOTP();
    const expiration = new Date(Date.now() + 5 * 60 * 1000);

    user.login_otp = otp;
    user.login_otp_expiration = expiration;

    await userRepository.save(user);

    await sendEmail(user.email, otp);

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
  req: TRequest<TEmailUserDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { email } = req.dto;

    const userRepository = getRepo(UserEntity);

    const user = await userRepository.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const token = encode({ id: user.id });

    user.reset_token = token;

    user.reset_token_expiration = new Date(Date.now() + 60 * 60 * 1000);

    await userRepository.save(user);

    await sendResetEmail(user.email, token);

    res
      .status(200)
      .json({ message: "Reset password link is sent to your email" });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: TRequest<TPasswordDTO>,
  res: TResponse,
  next: NextFunction,
) {
  try {
    const { password, token } = req.dto;
    const userRepository = getRepo(UserEntity);
    const user = await userRepository.findOne({
      where: { reset_token: token },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (user.reset_token_expiration < new Date()) {
      return res.status(400).json({ message: "Invalid or expired token" });
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
      addresses
    } = req.me;
    res.status(200).json({
      data: {
        id,
        first_name,
        last_name,
        email,
        phone,
        addresses
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(
  req: TRequest<TUpdateUserDTO>,
  res: TResponse,
  next: NextFunction,
) {
  const { id } = req.me;
  const { first_name, last_name, phone } =
    req.dto;

  try {
    const userRepository = getRepo(UserEntity);

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // const existingUserEmail = await userRepository.findOne({
    //   where: { email },
    // });

    const existingUserPhone = await userRepository.findOne({
      where: { phone },
    });

    // if (existingUserEmail && existingUserEmail.id != id) {
    //   return res.status(400).json({ message: "Email already exists" });
    // }

    if (existingUserPhone && existingUserPhone.id != id) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    if(!validatePhoneNumber(phone)){
      return res.status(400).json({message:'Invalid phone number'})
    }

    user.first_name = first_name;
    user.last_name = last_name;
    // user.address = address;
    // user.city = city;
    // user.email = email;
    // user.pincode = pincode;
    user.phone = phone;
    // user.state = state;

    await userRepository.save(user);

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req:TRequest<TAddressDTO>,res:TResponse,next:NextFunction){
  try {
    const {id} = req.me;
    const {address,city,pincode,state} = req.dto
    const addRepo = getRepo(AddressesEntity);

    const newAddress = addRepo.create({
      user_id:id,
      address,
      city,
      pincode,
      state
    });

    await addRepo.save(newAddress);

    return res.status(201).json({message:'Address created successfully',add:newAddress});
  } catch (error) {
    next(Error);
  }
}

export async function updateAddress(req:TRequest<TAddressDTO>,res:TResponse,next:NextFunction){
  try {
    const {id} = req.me;
    const addressId = Number(req.params.addressId);

    const {address,city,pincode,state} = req.dto

    if(!addressId){
      return res.status(400).json({message:'Invalid request'});
    }

    const addRepo = getRepo(AddressesEntity);

    const updatingAddress = await addRepo.findOne({
      where:{user_id:id,id:addressId}
    })

    if(!updatingAddress){
      return res.status(404).json({message:'Address not found'});
    }

    updatingAddress.address = address;
    updatingAddress.city = city;
    updatingAddress.pincode = pincode;
    updatingAddress.state = state;

    await addRepo.save(updatingAddress);

    return res.status(200).json({message:'Address updated successfully'})
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(
  req: TRequest,
  res: TResponse,
  next: NextFunction
) {
  try {
    const { id } = req.me;
    const addressId = Number(req.params.addressId);

    const addRepo = getRepo(AddressesEntity);

    const totalAddresses = await addRepo.count({
      where: { user_id: id },
    });

    if (totalAddresses <= 1) {
      return res.status(400).json({
        message: "You must have at least one address",
      });
    }

    const address = await addRepo.findOne({
      where: { id: addressId, user_id: id },
    });

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    await addRepo.delete(addressId);

    return res
      .status(200)
      .json({ message: "Address deleted successfully" });
  } catch (error) {
    next(error);
  }
}
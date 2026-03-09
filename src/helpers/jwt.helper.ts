import { Constants } from "@configs";
import jwt from "jsonwebtoken";

export const encode = <T extends object>(data: T): string => {
  return jwt.sign(data, `${process.env.JWT_SECRET}_${Constants.JWT_TOKEN_VERSION}`);
};

export const decode = <ResT>(token: string): ResT | false => {
  if (token) {
    try {
      return jwt.verify(token, `${process.env.JWT_SECRET}_${Constants.JWT_TOKEN_VERSION}`) as ResT;
    } catch (_error) {
      return false;
    }
  }
  return false;
};

export const justDecode = (token: string): string | object | false => {
  if (token) {
    try {
      return jwt.decode(token);
    } catch (_error) {
      return false;
    }
  }
  return false;
};

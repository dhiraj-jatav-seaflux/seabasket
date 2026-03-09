import { Constants } from "@configs";
import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const hashedPassword = await bcrypt.hash(password, Constants.BCRYPT_SALT_ROUND);
  return hashedPassword;
};

export const verifyPassword = async (plainTextPassword: string, hashedPassword: string) => {
  const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
  return isMatch;
};

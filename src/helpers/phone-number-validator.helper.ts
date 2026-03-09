import PhoneNumber from "libphonenumber-js";

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const parsedNumber = PhoneNumber(phoneNumber);

  if (parsedNumber && parsedNumber.country) {
    return true;
  }
  return false;
};

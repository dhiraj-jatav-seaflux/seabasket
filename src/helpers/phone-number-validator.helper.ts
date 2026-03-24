import parsePhoneNumber from "libphonenumber-js";

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
    return false;
  }

  try {
    const parsedNumber = parsePhoneNumber(phoneNumber, "IN");
    return parsedNumber?.isValid() ?? false;
  } catch {
    return false;
  }
};
export const enums = {
  status: ["Active", "Inactive", "Archive", "Delete"],
};

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum Status{
  PENDING = 'PENDING',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED'
}

export enum PaymentMode {
  COD = 'COD',
  ONLINE = 'ONLINE'
}
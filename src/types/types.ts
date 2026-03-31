import { UserEntity } from "@entities";
import { Request, Response } from "express";

export interface Me {
  id: number;
}

export interface DecodedIdToken {
  iss: string; // Issuer
  nbf: number; // Not Before time (Unix timestamp)
  aud: string; // Audience
  sub: string; // Subject identifier
  hd: string; // Hosted domain
  email: string; // Email address
  azp: string; // Authorized party
  name: string; // Full name
  iat: number; // Issued At time (Unix timestamp)
  exp: number; // Expiration time (Unix timestamp)
  jti: string; // JWT ID
}

export interface TRequest<T = any> extends Request {
  // isAdmin?:T
  me?: UserEntity;
  dto?: T;
  files: any;
  t: (key: string, opts?: any) => string;
  pager: {
    page: number;
    limit: number;
  };
}

export interface TResponse extends Response {}
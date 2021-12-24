import { UserRole } from "../../models/user/types";

export type RequestSignInBody = {
  username: string;
  password: string;
};

export type RequestSignUpBody = {
  username: string;
  password: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  nickname: string;
  role: UserRole;
};

export type DecodedUser = {
  username: string;
  role: UserRole;
};

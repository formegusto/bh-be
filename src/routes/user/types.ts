import { UserRole } from "../../models/user/types";

export type RequestUserBody = {
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

import { UserRole } from "../../models/user/types";

export type RequestUserBody = {
  username: string;
  password: string;
  email: string;
  phone: string;
  nickname: string;
  role: UserRole;
};

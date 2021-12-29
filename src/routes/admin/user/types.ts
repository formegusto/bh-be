import { UserAttributes, UserRole } from "../../../models/user/types";

export type UserQuery = {
  offset?: number;
};

export type GetUsersResponse = {
  currentPage: number;
  lastPage: number;
  count: number;
  users: UserAttributes[];
};

export type PatchUserRequest = {
  role?: UserRole;
};

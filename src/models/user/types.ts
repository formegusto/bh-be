import { Optional } from "sequelize/dist";

export enum UserRole {
  user = "USER",
  admin = "ADMIN",
}

export type UserAttributes = {
  readonly id: number;
  username: string;
  password: string;
  email: string;
  phone: string;
  nickname: string;
  role: UserRole;
};

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

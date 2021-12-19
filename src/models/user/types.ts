import { Optional } from "sequelize/dist";

export enum UserRole {
  user = "USER",
  admin = "ADMIN",
}

export type UserAttributes = {
  readonly id: number;
  username: string;
  password: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  role: UserRole;
};

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id"> {}

import { Optional } from "sequelize/dist";

export enum ApiApplicationStatus {
  inactive = "INACTIVE",
  active = "ACTIVE",
}

export type ApiApplicationAttributes = {
  readonly id: number;
  purpose: string;
  apiKey: string;
  symmetricKey: string;
  status?: ApiApplicationStatus;
  readonly userId: number;
};

export interface ApiApplicationCreationAttributes
  extends Optional<ApiApplicationAttributes, "id"> {}

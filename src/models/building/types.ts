import { Optional } from "sequelize/dist";

export type BuildingAttributes = {
  readonly id: number;
  image?: string;
  name: string;
};

export interface BuildingCreationAttributes
  extends Optional<BuildingAttributes, "id"> {}

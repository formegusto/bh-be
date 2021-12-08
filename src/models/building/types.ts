import { Optional } from "sequelize/dist";

export type BuildingAttributes = {
  readonly id: number;
  name: string;
};

export interface BuildingCreationAttributes
  extends Optional<BuildingAttributes, "id"> {}

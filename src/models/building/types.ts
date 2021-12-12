import { Optional } from "sequelize/dist";

export type BuildingAttributes = {
  readonly id: number;
  name: string;
  ho: string;
};

export interface BuildingCreationAttributes
  extends Optional<BuildingAttributes, "id"> {}

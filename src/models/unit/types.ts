import { Optional } from "sequelize/dist";

export type UnitAttributes = {
  readonly id: number;
  name: string;
  readonly buildingId: number;
};

export interface UnitCreationAttributes
  extends Optional<UnitAttributes, "id"> {}

import { Optional } from "sequelize/dist";

export type SensorAttributes = {
  readonly id: number;
  name: string;
  readonly buildingId: number;
};

export interface SensonCreationAttributes
  extends Optional<SensorAttributes, "id"> {}

import { Model, Optional } from "sequelize/dist";

export type InformationAttributes = {
  readonly id: number;
  value: string;
  readonly sensorReportId: number;
};

export interface InformationCreationAttributes
  extends Optional<InformationAttributes, "id"> {}

export type InformationMap = {
  [key: string]: Model;
};

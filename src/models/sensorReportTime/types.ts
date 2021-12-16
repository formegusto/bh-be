import { Optional } from "sequelize/dist";

export type SensorReportTimeAttributes = {
  readonly id: number;
  readonly sensorId?: number;
};

export interface SensorReportTimeCreationAttributes
  extends Optional<SensorReportTimeAttributes, "id"> {}

import { Optional } from "sequelize/dist";

export type SensorReportTimeAttributes = {
  readonly id: number;
  time: Date;
  readonly sensorId: number;
};

export interface SensorReportTimeCreationAttributes
  extends Optional<SensorReportTimeAttributes, "id"> {}

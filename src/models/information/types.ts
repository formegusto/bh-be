import { HasManyCreateAssociationMixin, Model, Optional } from "sequelize/dist";
import InformationModel from ".";

export type InformationAttributes = {
  readonly id: number;
  value: string;
  readonly sensorReportId: number;
};

export interface InformationCreationAttributes
  extends Optional<InformationAttributes, "id"> {}

export type InformationName =
  | "IsStay"
  | "isStay"
  | "ResidentCount"
  | "residentCount"
  | "Temperature"
  | "temperature"
  | "Humidity"
  | "humidity"
  | "Lux"
  | "lux"
  | "SkinTemperature"
  | "skinTemperature"
  | "ResidentDistribution"
  | "residentDistribution"
  | "Satisfaction"
  | "satisfaction";

export type InformationMap = {
  [key: string]: InformationModel;
};

export type InformationCreateMap = {
  [key: string]: HasManyCreateAssociationMixin<any>;
};

import { ModelStatic } from "sequelize/dist";
import BuildingModel from "../../../models/building";
import SensorModel from "../../../models/sensor";
import SensorReportTimeModel from "../../../models/sensorReportTime";
import UnitModel from "../../../models/unit";

export enum TARGET {
  BUILDING = "building",
  UNIT = "unit",
  SENSOR = "sensor",
  REPORT = "report",
}

export const TARGET_MODEL: { [key: string]: any } = {
  [TARGET.BUILDING]: BuildingModel,
  [TARGET.UNIT]: UnitModel,
  [TARGET.SENSOR]: SensorModel,
  [TARGET.REPORT]: SensorReportTimeModel,
};

export type POST_OR_PATCH_BODY = {
  name?: string;
  image?: string;
  buildingId?: string;
  unitId?: string;
};

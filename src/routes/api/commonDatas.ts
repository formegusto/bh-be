import InformationModel from "../../models/information";
import {
  HumidityModel,
  IsStayModel,
  LuxModel,
  ResidentCountModel,
  ResidentDistributionModel,
  SatisfactionModel,
  SkinTemperatureModel,
  TemperatureModel,
} from "../../models/information/models";
import { IncludeColumns, InformationMap } from "./types";

export const includeColums: IncludeColumns = [
  "all",
  "temperature",
  "humidity",
  "isStay",
  "lux",
  "residentCount",
  "residentDistribution",
  "satisfaction",
  "skinTemperature",
];

export const informationMap: InformationMap = {
  humidity: HumidityModel,
  isStay: IsStayModel,
  lux: LuxModel,
  residentCount: ResidentCountModel,
  residentDistribution: ResidentDistributionModel,
  satisfaction: SatisfactionModel,
  skinTemperature: SkinTemperatureModel,
  temperature: TemperatureModel,
};

export const informations: InformationModel[] = [
  HumidityModel,
  IsStayModel,
  LuxModel,
  ResidentCountModel,
  ResidentDistributionModel,
  SatisfactionModel,
  SkinTemperatureModel,
  TemperatureModel,
];

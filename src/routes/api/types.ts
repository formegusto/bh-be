import InformationModel from "../../models/information";

export type Columns =
  | "all"
  | "isStay"
  | "residentCount"
  | "temperature"
  | "humidity"
  | "lux"
  | "skinTemperature"
  | "residentDistribution"
  | "satisfaction";

export type IncludeColumns = Columns[];

export type InformationMap = {
  [key: string]: InformationModel;
};

export type RequestBEMSApi = {
  include?: string;
  exclude?: string;
  startDate?: string; // YYYY-MM-DDThh:mm
  endDate?: string; // YYYY-MM-DDThh:mm
};

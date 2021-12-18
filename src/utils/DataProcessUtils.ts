import InformationModel from "../models/information";
import {
  HumidityModel,
  informationModels,
  IsStayModel,
  LuxModel,
  ResidentCountModel,
  ResidentDistributionModel,
  SatisfactionModel,
  SkinTemperatureModel,
  TemperatureModel,
} from "../models/information/models";
import { includeColums, informationMap } from "../routes/api/commonDatas";
import { Columns, IncludeColumns } from "../routes/api/types";

export function getModelsByIncludeColumns(cols: string[]): InformationModel[] {
  let infos: InformationModel[] = [];

  for (let i = 0; i < cols.length; i++) {
    // 공백 제거
    const trimCol = cols[i].trim() as Columns;
    // 포함되지 않는 것들은 무시. bad request를 때리려했으나, 무시하는 것이 맞는 것 같다.
    if (includeColums.includes(trimCol)) {
      if (trimCol === "all") {
        return informationModels;
      } else {
        infos.push(informationMap[trimCol]);
      }
    }
  }

  return infos;
}

export function getModelsByExcludeColumns(cols: string[]): InformationModel[] {
  let infos: InformationModel[] = informationModels;

  // 포함되지 않는 것들은 무시. bad request를 때리려했으나, 무시하는 것이 맞는 것 같다.
  for (let i = 0; i < cols.length; i++) {
    const trimCol = cols[i].trim() as Columns;
    if (includeColums.includes(trimCol)) {
      if (trimCol !== "all") {
        const filterModel = informationMap[trimCol];
        infos = infos.filter((info) => info !== filterModel);
      }
    }
  }

  return infos;
}

export function getModelAsByModel(model: InformationModel): string {
  switch (model) {
    case IsStayModel:
      return "isStay";
    case ResidentCountModel:
      return "residentCount";
    case TemperatureModel:
      return "temperature";
    case HumidityModel:
      return "humidity";
    case LuxModel:
      return "lux";
    case SkinTemperatureModel:
      return "skinTemperature";
    case ResidentDistributionModel:
      return "residentDistribution";
    case SatisfactionModel:
      return "satisfaction";
    default:
      throw new Error("Invalid Model");
  }
}

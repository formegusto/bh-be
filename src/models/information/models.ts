import { access } from "fs";
import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import SensorReportTimeModel from "../sensorReportTime";
import {
  InformationAttributes,
  InformationCreationAttributes,
  InformationMap,
} from "./types";

const informationAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sensorReportId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
};

class InformationModel
  extends Model<InformationAttributes, InformationCreationAttributes>
  implements InformationAttributes
{
  public readonly id!: number;
  public value!: string;
  public readonly sensorReportId!: number;

  public readonly createdAt!: Date;
  public readonly deletedAt!: Date;

  public static initConfig(sequelize: Sequelize, modelName: string) {
    this.init(informationAttributes, {
      sequelize,
      modelName,
      tableName: modelName,
    });
  }
}

class IsStayModel extends InformationModel {}
class ResidentCountModel extends InformationModel {}
class TemperatureModel extends InformationModel {}
class HumidityModel extends InformationModel {}
class IlluminanceModel extends InformationModel {}
class SkinTemperatureModel extends InformationModel {}
class ResidentDistributionModel extends InformationModel {}
class SatisfactionModel extends InformationModel {}

export const informationModels = [
  IsStayModel,
  ResidentCountModel,
  TemperatureModel,
  HumidityModel,
  IlluminanceModel,
  SkinTemperatureModel,
  ResidentDistributionModel,
  SatisfactionModel,
];
export const informationNames = [
  "IsStay",
  "ResidentCount",
  "Temperature",
  "Humidity",
  "Illuminance",
  "SkinTemperature",
  "ResidentDistribution",
  "Satisfaction",
];

export const informationMap: InformationMap = informationModels.reduce(
  (acc, cur, idx) => ({
    ...acc,
    [informationNames[idx]]: cur,
  }),
  {}
);

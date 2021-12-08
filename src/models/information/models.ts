import { DataTypes, Model, ModelAttributes, Sequelize } from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import {
  InformationAttributes,
  InformationCreationAttributes,
  InformationMap,
  InformationName,
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
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("value", cipherValue);
    },
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
      timestamps: false,
    });
  }
}

export class IsStayModel extends InformationModel {}
export class ResidentCountModel extends InformationModel {}
export class TemperatureModel extends InformationModel {}
export class HumidityModel extends InformationModel {}
export class LuxModel extends InformationModel {}
export class SkinTemperatureModel extends InformationModel {}
export class ResidentDistributionModel extends InformationModel {}
export class SatisfactionModel extends InformationModel {}

export const informationModels = [
  IsStayModel,
  ResidentCountModel,
  TemperatureModel,
  HumidityModel,
  LuxModel,
  SkinTemperatureModel,
  ResidentDistributionModel,
  SatisfactionModel,
];
export const informationNames: InformationName[] = [
  "IsStay",
  "ResidentCount",
  "Temperature",
  "Humidity",
  "Lux",
  "SkinTemperature",
  "ResidentDistribution",
  "Satisfaction",
];

export const informationMap: InformationMap = informationModels.reduce(
  (acc, cur, idx) => ({
    ...acc,
    [informationNames[idx][0].toLowerCase() + informationNames[idx].slice(1)]:
      cur,
  }),
  {}
);

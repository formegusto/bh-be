import moment from "moment";
import { DataTypes, Model, ModelAttributes, Sequelize } from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB } from "../../utils/indbEncrypt";
import SensorReportTimeModel from "../sensorReportTime";
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
    get() {
      return ariaAfterOutDB(this, "value");
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

  public static initConfig(sequelize: Sequelize, modelName: string) {
    this.init(informationAttributes, {
      sequelize,
      modelName: modelName[0].toLowerCase() + modelName.slice(1),
      tableName: modelName,
      timestamps: false,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    });
  }

  public static associationsConfig(modelName: string) {
    this.belongsTo(SensorReportTimeModel, {
      as: modelName[0].toLowerCase() + modelName.slice(1),
    });
  }
}

export class IsStayModel extends InformationModel {} // 재실유무
export class ResidentCountModel extends InformationModel {} // 거주자 수
export class TemperatureModel extends InformationModel {} // 온도
export class HumidityModel extends InformationModel {} // 습도
export class LuxModel extends InformationModel {} // 조도
export class SkinTemperatureModel extends InformationModel {} // 피부온도
export class ResidentDistributionModel extends InformationModel {} // 거주자 분포
export class SatisfactionModel extends InformationModel {} // 만족도

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

import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import BuildingModel from "../building";
import SensorReportTimeModel from "../sensorReportTime";
import { SensonCreationAttributes, SensorAttributes } from "./types";

const sensorAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  buildingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
};

class SensorModel
  extends Model<SensorAttributes, SensonCreationAttributes>
  implements SensorAttributes
{
  public readonly id!: number;
  public name!: string;
  public readonly buildingId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly building?: BuildingModel;
  public readonly timeReports?: SensorReportTimeModel[];
  public static associations: {
    building: Association<SensorModel, BuildingModel>;
    timeReports: Association<SensorModel, SensorReportTimeModel>;
  };

  public static initConfig(sequelize: Sequelize) {
    SensorModel.init(sensorAttributes, {
      sequelize,
      modelName: "Sensor",
    });
  }

  public static associationsConfig() {
    SensorModel.belongsTo(BuildingModel, {
      targetKey: "id",
      foreignKey: "buildingId",
    });
    SensorModel.hasMany(SensorReportTimeModel, {
      sourceKey: "id",
      foreignKey: "sensorId",
      as: { singular: "timeReport", plural: "timeReports" },
    });
  }
}

export default SensorModel;

import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import { informationModels, informationNames } from "../information/models";
import SensorModel from "../sensor";
import {
  SensorReportTimeAttributes,
  SensorReportTimeCreationAttributes,
} from "./types";

const sensorReportTimeAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  sensorId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
};

class SensorReportTimeModel
  extends Model<SensorReportTimeAttributes, SensorReportTimeCreationAttributes>
  implements SensorReportTimeAttributes
{
  public readonly id!: number;
  public time!: Date;
  public readonly sensorId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly sensor?: SensorModel;
  public static associations: {
    sensor: Association<SensorReportTimeModel, SensorModel>;
  };

  public static initConfig(sequelize: Sequelize) {
    SensorReportTimeModel.init(sensorReportTimeAttributes, {
      sequelize,
      modelName: "SensorReportTime",
    });
  }

  public static associationConfig() {
    SensorReportTimeModel.belongsTo(SensorModel, {
      targetKey: "id",
      foreignKey: "sensorId",
    });
    informationModels.forEach((_, idx) => {
      SensorReportTimeModel.hasMany(_, {
        sourceKey: "id",
        foreignKey: "sensorReportId",
        as: {
          singular: informationNames[idx],
          plural: `${informationNames[idx]}s`,
        },
      });
    });
  }
}

export default SensorReportTimeModel;

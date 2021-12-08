import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import SensorModel from "../sensor";
import { BuildingAttributes, BuildingCreationAttributes } from "./types";

const buildingAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
};

class BuildingModel
  extends Model<BuildingAttributes, BuildingCreationAttributes>
  implements BuildingAttributes
{
  public readonly id!: number;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly sensors?: SensorModel;
  public static associations: {
    sensors: Association<BuildingModel, SensorModel>;
  };

  public static initConfig(sequelize: Sequelize) {
    BuildingModel.init(buildingAttributes, {
      sequelize,
      modelName: "Building",
    });
  }

  public static associationsConfig() {
    BuildingModel.hasMany(SensorModel, {
      sourceKey: "id",
      foreignKey: "buildingId",
    });
  }
}

export default BuildingModel;

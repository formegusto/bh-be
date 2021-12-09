import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Options,
  Sequelize,
} from "sequelize/dist";
import { RequestBuilding } from "../../routes/admin/humanData/types";
import { encryptProcess } from "../../utils/ARIAUtils";
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
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("name", cipherValue);
    },
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
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      hooks: {
        beforeFind: ({ where }) => {
          const plainText = (where as any)["name"];
          const cipherText = encryptProcess(plainText);

          (where as any)["name"] = cipherText;
        },
      },
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

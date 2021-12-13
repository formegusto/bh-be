import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Options,
  Sequelize,
} from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB } from "../../utils/indbEncrypt";
import SensorModel from "../sensor";
import { BuildingAttributes, BuildingCreationAttributes } from "./types";

const buildingAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("name", cipherValue);
    },
    get() {
      return ariaAfterOutDB(this, "name");
    },
    primaryKey: true,
  },
  ho: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("ho", cipherValue);
    },
    get() {
      return ariaAfterOutDB(this, "ho");
    },
    primaryKey: true,
  },
};

class BuildingModel
  extends Model<BuildingAttributes, BuildingCreationAttributes>
  implements BuildingAttributes
{
  public readonly id!: number;
  public name!: string;
  public ho!: string;

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
          if (where && (where as any)["name"]) {
            const plainText = (where as any)["name"];
            const cipherText = encryptProcess(plainText);

            (where as any)["name"] = cipherText;
          }
          if (where && (where as any)["ho"]) {
            const plainText = (where as any)["ho"];
            const cipherText = encryptProcess(plainText);

            (where as any)["ho"] = cipherText;
          }
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

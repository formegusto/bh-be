import moment from "moment";
import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB } from "../../utils/indbEncrypt";
import UnitModel from "../unit";
import { BuildingAttributes, BuildingCreationAttributes } from "./types";

const buildingAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    unique: true,
    autoIncrement: true,
  },
  image: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
    defaultValue: null,
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("image", cipherValue);
    },
    get() {
      return ariaAfterOutDB(this, "image");
    },
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
  createdAt: {
    type: DataTypes.DATE,
    get() {
      return moment(this.getDataValue("createdAt")).add(9, "h");
    },
  },
  updatedAt: {
    type: DataTypes.DATE,
    get() {
      return moment(this.getDataValue("updatedAt")).add(9, "h");
    },
  },
};

class BuildingModel
  extends Model<BuildingAttributes, BuildingCreationAttributes>
  implements BuildingAttributes
{
  public readonly id!: number;
  public image!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly units?: UnitModel[];

  public static associations: {
    units: Association<BuildingModel, UnitModel>;
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
        },
      },
    });
  }

  public static associationsConfig() {
    BuildingModel.hasMany(UnitModel, {
      sourceKey: "id",
      foreignKey: "buildingId",
      as: { singular: "unit", plural: "units" },
    });
  }
}

export default BuildingModel;

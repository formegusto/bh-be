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
import { UnitAttributes, UnitCreationAttributes } from "./types";
import BuildingModel from "../building";
import SensorModel from "../sensor";

const unitAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    unique: true,
    autoIncrement: true,
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
  buildingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
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

class UnitModel
  extends Model<UnitAttributes, UnitCreationAttributes>
  implements UnitAttributes
{
  public readonly id!: number;
  public name!: string;
  public readonly buildingId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly building?: BuildingModel;
  public readonly sensors?: SensorModel[];

  public static associations: {
    building: Association<UnitModel, BuildingModel>;
    sensors: Association<UnitModel, SensorModel>;
  };

  public static initConfig(sequelize: Sequelize) {
    UnitModel.init(unitAttributes, {
      sequelize,
      modelName: "Unit",
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

  public static associationConfig() {
    UnitModel.belongsTo(BuildingModel, {
      targetKey: "id",
      foreignKey: "buildingId",
    });
    UnitModel.hasMany(SensorModel, {
      sourceKey: "id",
      foreignKey: "unitId",
      as: { singular: "sensor", plural: "sensors" },
    });
  }
}

export default UnitModel;

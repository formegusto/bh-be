import moment from "moment";
import {
  Association,
  DataTypes,
  HasManyCreateAssociationMixin,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB } from "../../utils/indbEncrypt";
import SensorReportTimeModel from "../sensorReportTime";
import UnitModel from "../unit";
import { SensonCreationAttributes, SensorAttributes } from "./types";

const sensorAttributes: ModelAttributes = {
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
  unitId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    get() {
      return moment(this.getDataValue("createdAt")).add(9, "h");
    },
    primaryKey: true,
  },
  updatedAt: {
    type: DataTypes.DATE,
    get() {
      return moment(this.getDataValue("updatedAt")).add(9, "h");
    },
  },
};

class SensorModel
  extends Model<SensorAttributes, SensonCreationAttributes>
  implements SensorAttributes
{
  public readonly id!: number;
  public name!: string;
  public readonly unitId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly unit?: UnitModel;
  public readonly timeReports?: SensorReportTimeModel[];

  public readonly createTimeReport!: HasManyCreateAssociationMixin<SensorReportTimeModel>;

  public static associations: {
    unit: Association<SensorModel, UnitModel>;
    timeReports: Association<SensorModel, SensorReportTimeModel>;
  };

  public static initConfig(sequelize: Sequelize) {
    SensorModel.init(sensorAttributes, {
      sequelize,
      modelName: "Sensor",
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
    SensorModel.belongsTo(UnitModel, {
      targetKey: "id",
      foreignKey: "unitId",
    });
    SensorModel.hasMany(SensorReportTimeModel, {
      sourceKey: "id",
      foreignKey: "sensorId",
      as: { singular: "timeReport", plural: "timeReports" },
    });
  }
}

export default SensorModel;

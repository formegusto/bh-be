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
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("name", cipherValue);
    },
    get() {
      return ariaAfterOutDB(this, "name");
    },
  },
  buildingId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
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

  public readonly createTimeReport!: HasManyCreateAssociationMixin<SensorReportTimeModel>;

  public static associations: {
    building: Association<SensorModel, BuildingModel>;
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

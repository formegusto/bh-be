import moment from "moment";
import {
  Association,
  DataTypes,
  HasManyCreateAssociationMixin,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import InformationModel from "../information";
import {
  HumidityModel,
  informationModels,
  informationNames,
  IsStayModel,
  LuxModel,
  ResidentCountModel,
  ResidentDistributionModel,
  SatisfactionModel,
  SkinTemperatureModel,
  TemperatureModel,
} from "../information/models";
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
  sensorId: {
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

class SensorReportTimeModel
  extends Model<SensorReportTimeAttributes, SensorReportTimeCreationAttributes>
  implements SensorReportTimeAttributes
{
  [key: string]: any;
  public readonly id!: number;
  public readonly sensorId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly createIsStay!: HasManyCreateAssociationMixin<IsStayModel>;
  public readonly createResidentCount!: HasManyCreateAssociationMixin<ResidentCountModel>;
  public readonly createTemperature!: HasManyCreateAssociationMixin<TemperatureModel>;
  public readonly createHumidity!: HasManyCreateAssociationMixin<HumidityModel>;
  public readonly createLux!: HasManyCreateAssociationMixin<LuxModel>;
  public readonly createSkinTemperature!: HasManyCreateAssociationMixin<SkinTemperatureModel>;
  public readonly createResidentDistribution!: HasManyCreateAssociationMixin<ResidentDistributionModel>;
  public readonly createSatisfaciton!: HasManyCreateAssociationMixin<SatisfactionModel>;

  public readonly sensor?: SensorModel;
  public readonly isStay?: IsStayModel;
  public readonly residentCount?: ResidentCountModel;
  public readonly temperature?: TemperatureModel;
  public readonly humidity?: HumidityModel;
  public readonly lux?: LuxModel;
  public readonly skinTemperature?: SkinTemperatureModel;
  public readonly residentDistribution?: ResidentDistributionModel;
  public readonly satisfaction?: SatisfactionModel;

  public static associations: {
    sensor: Association<SensorReportTimeModel, SensorModel>;
    isStay: Association<SensorReportTimeModel, IsStayModel>;
    residentCount: Association<SensorReportTimeModel, ResidentCountModel>;
    temperature: Association<SensorReportTimeModel, TemperatureModel>;
    humidity: Association<SensorReportTimeModel, HumidityModel>;
    lux: Association<SensorReportTimeModel, LuxModel>;
    skinTemperature: Association<SensorReportTimeModel, SkinTemperatureModel>;
    residentDistribution: Association<
      SensorReportTimeModel,
      ResidentDistributionModel
    >;
    satisfaction: Association<SensorReportTimeModel, SatisfactionModel>;
  };

  public static initConfig(sequelize: Sequelize) {
    SensorReportTimeModel.init(sensorReportTimeAttributes, {
      sequelize,
      modelName: "SensorReportTime",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    });
  }

  public static associationsConfig() {
    SensorReportTimeModel.belongsTo(SensorModel, {
      targetKey: "id",
      foreignKey: "sensorId",
    });
    informationModels.forEach((_, idx) => {
      SensorReportTimeModel.hasOne(_, {
        sourceKey: "id",
        foreignKey: "sensorReportId",
        as:
          informationNames[idx][0].toLowerCase() +
          informationNames[idx].slice(1),
      });
    });
  }
}

export default SensorReportTimeModel;

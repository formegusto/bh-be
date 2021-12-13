import dotenv from "dotenv";
import { Sequelize } from "sequelize/dist";
import ApiApplicationModel from "./apiApplication";
import BuildingModel from "./building";
import InformationModel from "./information";
import SensorModel from "./sensor";
import SensorReportTimeModel from "./sensorReportTime";
import UserModel from "./user";

dotenv.config();

const database = process.env.DB_NAME;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = parseInt(process.env.DB_PORT!);

const sequelize = new Sequelize(database!, username!, password!, {
  host,
  port,
  dialect: "mysql",
  timezone: "+9:00",
});

// Data Part
BuildingModel.initConfig(sequelize);
SensorModel.initConfig(sequelize);
SensorReportTimeModel.initConfig(sequelize);
InformationModel.initConfig(sequelize);

BuildingModel.associationsConfig();
SensorModel.associationsConfig();
SensorReportTimeModel.associationsConfig();

// User Service Part
UserModel.initConfig(sequelize);
ApiApplicationModel.initConfig(sequelize);

ApiApplicationModel.associationsConfig();

export default sequelize;

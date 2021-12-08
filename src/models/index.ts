import dotenv from "dotenv";
import { Sequelize } from "sequelize/dist";
import BuildingModel from "./building";
import InformationModel from "./information";
import SensorModel from "./sensor";
import SensorReportTimeModel from "./sensorReportTime";

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
});

BuildingModel.initConfig(sequelize);
SensorModel.initConfig(sequelize);
SensorReportTimeModel.initConfig(sequelize);
InformationModel.initConfig(sequelize);

BuildingModel.associationsConfig();
SensorModel.associationsConfig();
SensorReportTimeModel.associationConfig();

export default sequelize;

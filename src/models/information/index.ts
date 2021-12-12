import { Sequelize } from "sequelize/dist";
import { informationModels, informationNames } from "./models";

class InformationModel {
  public static initConfig(sequelize: Sequelize) {
    informationModels.forEach((_, idx) => {
      _.initConfig(sequelize, informationNames[idx]);
    });
  }

  public static associationsConfig() {
    informationModels.forEach((_, idx) => {
      _.associationsConfig(informationNames[idx]);
    });
  }
}

export default InformationModel;

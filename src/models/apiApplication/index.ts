import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import { ariaAfterOutDB, ariaBeforeInDB } from "../../utils/indbEncrypt";
import UserModel from "../user";
import {
  ApiApplicationStatus,
  ApiApplicationAttributes,
  ApiApplicationCreationAttributes,
} from "./types";

const apiApplicationAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  purpose: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "purpose");
    },
    get() {
      return ariaAfterOutDB(this, "purpose");
    },
  },
  apiKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val: any) {
      ariaBeforeInDB(this, val, "apiKey");
    },
    get() {
      return ariaAfterOutDB(this, "apiKey");
    },
  },
  decryptKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val: any) {
      ariaBeforeInDB(this, val, "decryptKey");
    },
    get() {
      return ariaAfterOutDB(this, "decryptKey");
    },
  },
  status: {
    type: DataTypes.ENUM(
      ApiApplicationStatus.inactive,
      ApiApplicationStatus.active
    ),
    allowNull: false,
    defaultValue: ApiApplicationStatus.inactive,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
};

class ApiApplicationModel
  extends Model<ApiApplicationAttributes, ApiApplicationCreationAttributes>
  implements ApiApplicationAttributes
{
  public readonly id!: number;
  public purpose!: string;
  public apiKey!: string;
  public decryptKey!: string;
  public status!: ApiApplicationStatus;
  public readonly userId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user!: UserModel;
  public static associations: {
    user: Association<ApiApplicationModel, UserModel>;
  };

  public static associationsConfig() {
    this.belongsTo(UserModel, {
      targetKey: "id",
      foreignKey: "userId",
    });
  }

  public static initConfig(sequelize: Sequelize) {
    this.init(apiApplicationAttributes, {
      sequelize,
      modelName: "ApiApplication",
    });
  }
}

export default ApiApplicationModel;
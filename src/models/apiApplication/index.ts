import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB, ariaBeforeInDB } from "../../utils/indbEncrypt";
import UserModel from "../user";
import {
  ApiApplicationStatus,
  ApiApplicationAttributes,
  ApiApplicationCreationAttributes,
} from "./types";

const ariaAttributes = ["purpose", "apiKey", "symmetricKey"];
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
  symmetricKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val: any) {
      ariaBeforeInDB(this, val, "symmetricKey");
    },
    get() {
      return ariaAfterOutDB(this, "symmetricKey");
    },
  },
  status: {
    type: DataTypes.ENUM(
      ApiApplicationStatus.INACTIVE,
      ApiApplicationStatus.WAITING,
      ApiApplicationStatus.ACTIVE
    ),
    allowNull: false,
    defaultValue: ApiApplicationStatus.WAITING,
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
  public symmetricKey!: string;
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
      as: "user",
    });
  }

  public static initConfig(sequelize: Sequelize) {
    this.init(apiApplicationAttributes, {
      sequelize,
      modelName: "ApiApplication",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      hooks: {
        beforeFind: ({ where }) => {
          if (where) {
            Object.keys(where as any).forEach((key) => {
              if (ariaAttributes.includes(key)) {
                const plainText = (where as any)[key];
                const cipherText = encryptProcess(plainText);
                (where as any)[key] = cipherText;
              }
            });
          }
        },
      },
    });
  }
}

export default ApiApplicationModel;

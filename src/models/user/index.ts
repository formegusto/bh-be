import {
  Association,
  DataTypes,
  Model,
  ModelAttributes,
  Sequelize,
} from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB, ariaBeforeInDB } from "../../utils/indbEncrypt";
import ApiApplicationModel from "../apiApplication";
import { UserAttributes, UserCreationAttributes, UserRole } from "./types";

const ariaAttributes = ["username", "email", "phone", "nickname"];
const userAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "username");
    },
    get() {
      return ariaAfterOutDB(this, "username");
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }, // 해시적용
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "name");
    },
    get() {
      return ariaAfterOutDB(this, "name");
    },
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "organization");
    },
    get() {
      return ariaAfterOutDB(this, "organization");
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "email");
    },
    get() {
      return ariaAfterOutDB(this, "email");
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "phone");
    },
    get() {
      return ariaAfterOutDB(this, "phone");
    },
  },
  role: {
    type: DataTypes.ENUM(UserRole.user, UserRole.admin),
    allowNull: false,
    defaultValue: UserRole.user,
  },
};

class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public readonly id!: number;
  public username!: string;
  public password!: string;
  public name!: string;
  public organization!: string;
  public email!: string;
  public phone!: string;
  public role!: UserRole;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly apiApplication?: ApiApplicationModel;
  public static associations: {
    apiApplication: Association<UserModel, ApiApplicationModel>;
  };

  public static associationsConfig() {
    this.hasOne(ApiApplicationModel, {
      sourceKey: "id",
      foreignKey: "userId",
      as: "apiApplication",
    });
  }
  public static initConfig(sequelize: Sequelize) {
    this.init(userAttributes, {
      sequelize,
      modelName: "User",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
      hooks: {
        beforeFind: ({ where }) => {
          if (where) {
            Object.keys(where as any).forEach((key) => {
              if (ariaAttributes.includes(key)) {
                const plaintText = (where as any)[key];
                const cipherText = encryptProcess(plaintText);
                (where as any)[key] = cipherText;
              }
            });
          }
        },
      },
    });
  }
}

export default UserModel;

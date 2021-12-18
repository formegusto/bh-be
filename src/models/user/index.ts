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
  association: {
    type: DataTypes.STRING,
    allowNull: false,
    set(val: any) {
      ariaBeforeInDB(this, val, "association");
    },
    get() {
      return ariaAfterOutDB(this, "association");
    },
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(val: any) {
      ariaBeforeInDB(this, val, "nickname");
    },
    get() {
      return ariaAfterOutDB(this, "nickname");
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
  public email!: string;
  public phone!: string;
  public association!: string;
  public nickname!: string;
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
    });
  }
  public static initConfig(sequelize: Sequelize) {
    this.init(userAttributes, {
      sequelize,
      modelName: "User",
      hooks: {
        beforeFind: ({ where }) => {
          Object.keys(where as any).forEach((key) => {
            if (ariaAttributes.includes(key)) {
              const plaintText = (where as any)[key];
              const cipherText = encryptProcess(plaintText);
              (where as any)[key] = cipherText;
            }
          });
        },
      },
    });
  }
}

export default UserModel;

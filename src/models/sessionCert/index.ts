import { DataTypes, Model, ModelAttributes, Sequelize } from "sequelize/dist";
import { encryptProcess } from "../../utils/ARIAUtils";
import { ariaAfterOutDB } from "../../utils/indbEncrypt";
import {
  SessionCertAttributes,
  SessionCertCreationAttributes,
  SessionStatus,
} from "./types";

const sessionCertAttributes: ModelAttributes = {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  publicKey: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  privateKey: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("privateKey", cipherValue);
    },
    get() {
      return ariaAfterOutDB(this, "privateKey");
    },
  },
  passphrase: {
    type: DataTypes.TEXT,
    allowNull: false,
    set(val: any) {
      if (val) {
        const cipherValue = encryptProcess(val.toString());
        this.setDataValue("passphrase", cipherValue);
      }
    },
    get() {
      if (this.getDataValue("passphrase"))
        return ariaAfterOutDB(this, "passphrase");
      else return null;
    },
  },
  symmetricKey: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(val: any) {
      const cipherValue = encryptProcess(val.toString());
      this.setDataValue("symmetricKey", cipherValue);
    },
    get() {
      return ariaAfterOutDB(this, "symmetricKey");
    },
  },
  status: {
    type: DataTypes.ENUM(
      SessionStatus.INIT,
      SessionStatus.MATCHING,
      SessionStatus.ESTABLISH
    ),
    allowNull: false,
    defaultValue: SessionStatus.INIT,
  },
  testString: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
};

class SessionCertModel
  extends Model<SessionCertAttributes, SessionCertCreationAttributes>
  implements SessionCertAttributes
{
  public readonly id!: number;
  public publicKey!: string;
  public privateKey!: string;
  public passphrase!: string;
  public symmetricKey!: string;
  public status!: SessionStatus;
  public testString!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initConfig(sequelize: Sequelize) {
    this.init(sessionCertAttributes, {
      sequelize,
      modelName: "SessionCert",
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    });
  }
}

export default SessionCertModel;

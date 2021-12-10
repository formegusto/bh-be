import { Model } from "sequelize/dist";
import bcrypt from "bcrypt";
import { decryptProcess, encryptProcess } from "./ARIAUtils";

export function hashingBeforeInDB(
  model: Model<any, any>,
  val: any,
  colName: any
) {
  const hash = bcrypt.hashSync(val.toString(), 20);
  model.setDataValue(colName, hash);
}

export function ariaBeforeInDB(model: Model<any, any>, val: any, colName: any) {
  const cipherText = encryptProcess(val.toString());
  model.setDataValue(colName, cipherText);
}

export function ariaAfterOutDB(model: Model<any, any>, colName: any) {
  const cipherText = model.getDataValue(colName);
  if (!cipherText) return undefined;
  const plainText = decryptProcess(cipherText);
  return plainText;
}

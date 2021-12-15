import { Optional } from "sequelize/dist";

export type SessionCertAttributes = {
  readonly id: number;
  publicKey: string;
  privateKey: string;
  passphrase: string;
  symmetricKey?: string;
};

export interface SessionCertCreationAttributes
  extends Optional<SessionCertAttributes, "id"> {}

export type RequestApplySymmetricKey = {
  id: number;
  symmetricKey: string;
};

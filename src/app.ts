import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import sequelize from "./models";
import Routes from "./routes";
import cors from "cors";
import ApiApplicationModel from "./models/apiApplication";
import UserModel from "./models/user";
import decryptBody from "./routes/middlewares/decryptBody";
import encryptBody from "./routes/middlewares/encryptBody";
import getRandomBytes from "./utils/getRandomBytes";
import { _generateKeyPair } from "./utils/_generateKeyPair";
import SessionCertModel from "./models/sessionCert";
import {
  RequestApplySymmetricKey,
  SessionStatus,
} from "./models/sessionCert/types";
import { createPrivateKey, privateDecrypt } from "crypto";
import { encryptProcess } from "./utils/ARIAUtils";
import SessionCertRoutes from "./routes/sessionCert";

dotenv.config();

sequelize
  .sync({ force: true })
  .then(async () => {
    console.log("[sequelize] synchronizing success :)");
    await ApiApplicationModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 80;
const app: express.Application = express();

app.use(cors());
app.use(express.json());

app.use("/sessionCert", SessionCertRoutes);
app.use(decryptBody, Routes, encryptBody);

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

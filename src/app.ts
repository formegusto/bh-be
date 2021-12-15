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

app.get("/publicKey", async (req: Request, res: Response) => {
  const passphrase = getRandomBytes(32);
  const keyPair = await _generateKeyPair(passphrase);

  const sessionCert = await SessionCertModel.create({
    passphrase,
    ...keyPair,
  });

  console.log("GET /publicKey status :", sessionCert.status);

  return res.status(200).json({
    status: true,
    sessionCert: {
      id: sessionCert.id,
      publicKey: sessionCert.publicKey,
    },
  });
});

app.post("/symmetricKey", async (req: Request, res: Response) => {
  const body = <RequestApplySymmetricKey>req.body;
  try {
    const sessionCert = await SessionCertModel.findByPk(body.id);

    if (sessionCert) {
      const key = createPrivateKey({
        key: sessionCert.privateKey,
        format: "pem",
        passphrase: sessionCert.passphrase,
      });

      const decSymKey = privateDecrypt(
        key,
        Buffer.from(body.symmetricKey.toString(), "base64")
      ).toString("utf8");
      const testString = getRandomBytes(32);

      const updateCert = await sessionCert.update({
        status: SessionStatus.MATCHING,
        symmetricKey: decSymKey,
        testString: testString,
      });
      console.log("POST /symmetricKey status :", updateCert.status);

      return res.status(200).json({
        status: true,
        testString,
      });
    } else {
      throw new Error("");
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
    });
  }
});

app.post("/establish", decryptBody, async (req: Request, res: Response) => {
  const { testString } = req.body;

  try {
    const certId = req.headers["session-cert-id"];
    const sessionCert = await SessionCertModel.findByPk(certId as any);

    if (testString === sessionCert?.testString) {
      const updateCert = await sessionCert?.update({
        status: SessionStatus.ESTABLISH,
      });

      console.log("POST /establish status :", updateCert?.status);

      return res.status(200).json({
        status: true,
        establish: true,
      });
    } else {
      return res.status(403).json({
        status: false,
        establish: false,
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
    });
  }
});

app.post(
  "/certTest",
  decryptBody,
  (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    console.log(body);

    res.custom = {
      status: 200,
      body,
    };

    return next();
  },
  encryptBody
);

app.delete(
  "/sessionCert",
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;

    try {
      const destroyRes = await SessionCertModel.destroy({
        where: {
          id,
        },
      });

      return res.status(200).json({
        status: true,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: false,
      });
    }
  }
);

app.use(decryptBody, Routes, encryptBody);

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

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
import { RequestApplySymmetricKey } from "./models/sessionCert/types";
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

      sessionCert.update({
        symmetricKey: decSymKey,
      });

      return res.status(200).json({
        status: true,
        decSymKey,
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

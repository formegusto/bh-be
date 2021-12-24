import { createPrivateKey, privateDecrypt } from "crypto";
import { Request, Response, Router } from "express";
import SessionCertModel from "../../models/sessionCert";
import {
  RequestApplySymmetricKey,
  SessionStatus,
} from "../../models/sessionCert/types";
import { encryptProcess } from "../../utils/ARIAUtils";
import getRandomBytes from "../../utils/getRandomBytes";
import { _generateKeyPair } from "../../utils/_generateKeyPair";
import decryptBody from "../middlewares/decryptBody";

const SessionCertRoutes = Router();

SessionCertRoutes.get("/publicKey", async (req: Request, res: Response) => {
  const passphrase = getRandomBytes(32);
  const keyPair = await _generateKeyPair(passphrase);

  try {
    const sessionCert = await SessionCertModel.create({
      passphrase,
      ...keyPair,
    });

    console.log("GET /publicKey status :", sessionCert.status);

    return res.status(201).json({
      status: true,
      sessionCert: {
        id: sessionCert.id,
        publicKey: sessionCert.publicKey,
      },
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: {
        message: err.message,
      },
    });
  }
});

SessionCertRoutes.post("/symmetricKey", async (req: Request, res: Response) => {
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

      const resBody = {
        status: true,
        testString,
      };

      const resBodyStr = JSON.stringify(resBody);
      const encResBodyStr = encryptProcess(resBodyStr, decSymKey);

      return res.status(201).send(encResBodyStr);
    } else {
      throw new Error("Invalid CertId");
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: false,
    });
  }
});

SessionCertRoutes.patch(
  "/establish",
  decryptBody,
  async (req: Request, res: Response) => {
    const { testString } = req.body;

    try {
      const certId = req.headers["session-cert-id"];
      const sessionCert = await SessionCertModel.findByPk(certId as any);

      if (sessionCert) {
        console.log(testString);
        console.log(sessionCert.testString);
        if (testString === sessionCert.testString) {
          const updateCert = await sessionCert.update({
            status: SessionStatus.ESTABLISH,
          });
          console.log("POST /establish status :", updateCert.status);

          return res.status(201).json({
            status: true,
            establish: true,
          });
        }
      } else {
        throw new Error("Invalid CertId");
      }
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        status: false,
      });
    }
  }
);

SessionCertRoutes.delete("/", (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (id) {
    }
  } catch (err) {
    console.error(err);

    return;
  }
});

export default SessionCertRoutes;

import { NextFunction, Request, Response } from "express";
import EncryptType from "../../utils/EncryptType";
import {
  decryptProcess,
  encryptProcess,
  requestBodyDecrypt,
} from "../../utils/ARIAUtils";
import SessionCertModel from "../../models/sessionCert";

export default async function decryptBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let requestEncryptType = req.headers["request-encrypt"] as EncryptType;

  if (requestEncryptType && requestEncryptType === EncryptType.PLAIN) {
    const apiKey = req.headers.authorization;
    if (!apiKey) {
      return res.status(403).json({
        status: false,
        error: {
          message: "PLAIN 데이터의 권한이 없습니다.",
        },
      });
    } else {
      if (apiKey !== process.env.ADMIN_REQUEST_KEY) {
        return res.status(403).json({
          status: false,
          error: {
            message: "PLAIN 데이터의 권한이 없습니다.",
          },
        });
      }
    }
    return next();
  }

  // 존재하지 않을 경우 기본값은 community key
  if (!requestEncryptType) requestEncryptType = EncryptType.COMMUNITY;

  // key matching
  let decryptKey: string | undefined;
  switch (requestEncryptType as any) {
    case EncryptType.COMMUNITY:
      decryptKey = process.env.COMMUNITY_KEY!;
      break;
    case EncryptType.CERT_COMMUNITY:
      const certId = req.headers["session-cert-id"];
      const sessionCert = await SessionCertModel.findByPk(certId as any);
      decryptKey = sessionCert?.symmetricKey;
      break;
  }

  if (req.body && req.body !== "") {
    if (typeof req.body === "object" && Object.keys(req.body).length === 0) {
      return next();
    }
    // 복호화
    console.log("------req body------");
    console.log(req.body);
    req.body = JSON.parse(decryptProcess(req.body, decryptKey));

    console.log("------dec req body------");
    console.log(req.body);
  }

  return next();
}

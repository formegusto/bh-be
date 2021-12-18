import { Request, Response } from "express";
import SessionCertModel from "../../models/sessionCert";
import { encryptProcess, requestBodyEncrypt } from "../../utils/ARIAUtils";
import EncryptType from "../../utils/EncryptType";

export default async function encryptBody(req: Request, res: Response) {
  let responseEncryptType = req.headers["response-encrypt"] as EncryptType;

  if (responseEncryptType && responseEncryptType === EncryptType.PLAIN) {
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
    return res.status(res.custom!.status).json(res.custom!.body);
  }

  if (!responseEncryptType) responseEncryptType = EncryptType.COMMUNITY;

  let encryptKey: string | undefined;
  switch (responseEncryptType as any) {
    case EncryptType.COMMUNITY:
      encryptKey = process.env.COMMUNITY_KEY!;
      break;
    case EncryptType.USER_SELF:
      encryptKey = req.decryptKey!;
      break;
    case EncryptType.CERT_COMMUNITY:
      const certId = req.headers["session-cert-id"];
      const cert = await SessionCertModel.findByPk(certId as any);
      encryptKey = cert?.symmetricKey;
      break;
  }
  const exclude = res.exclude;

  // 암호화
  if (res.custom) {
    const resBodyStr = JSON.stringify(res.custom?.body);
    console.log("------res body------");
    console.log(resBodyStr);
    console.log();
    const encBodyStr = encryptProcess(resBodyStr, encryptKey);
    console.log("------enc res body------");
    console.log(encBodyStr);
    console.log("\n\n");

    return res.status(res.custom!.status).send(encBodyStr);
  }

  return res.status(200).json({
    encryptBody: encryptProcess(JSON.stringify({ status: true })),
  });
}

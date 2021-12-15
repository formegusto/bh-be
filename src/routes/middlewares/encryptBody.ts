import { Request, Response } from "express";
import SessionCertModel from "../../models/sessionCert";
import { encryptProcess, requestBodyEncrypt } from "../../utils/ARIAUtils";
import EncryptType from "../../utils/EncryptType";

export default async function encryptBody(req: Request, res: Response) {
  let responseEncryptType = req.headers["response-encrypt"] as EncryptType;

  if (responseEncryptType && responseEncryptType === EncryptType.PLAIN) {
    return res.status(res.custom!.status).json(res.custom!.body);
  }

  if (!responseEncryptType) responseEncryptType = EncryptType.COMMUNITY;

  let encryptKey: string | undefined;
  switch (responseEncryptType as any) {
    case EncryptType.COMMUNITY:
      encryptKey = process.env.COMMUNITY_KEY!;
      break;
    case EncryptType.ENC_COMMUNITY:
      encryptKey = encryptProcess(process.env.COMMUNITY_KEY!);
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

  console.log("res", res.custom?.body);
  requestBodyEncrypt(res.custom?.body, encryptKey, exclude);
  console.log("res", res.custom?.body);

  return res.status(res.custom!.status).json(res.custom!.body);
}

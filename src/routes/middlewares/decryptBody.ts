import { NextFunction, Request, Response } from "express";
import EncryptType from "../../utils/EncryptType";
import { encryptProcess, requestBodyDecrypt } from "../../utils/ARIAUtils";

export default function decryptBody(
  req: Request,
  res: Response,
  next: NextFunction
) {
  let requestEncryptType = req.headers["request-encrypt"] as EncryptType;

  if (requestEncryptType && requestEncryptType === EncryptType.PLAIN) {
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
    case EncryptType.ENC_COMMUNITY:
      decryptKey = encryptProcess(process.env.COMMUNITY_KEY!);
      break;
  }
  requestBodyDecrypt(req.body, decryptKey);

  return next();
}

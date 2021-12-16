import { NextFunction, Request, Response } from "express";
import ApiApplicationModel from "../../models/apiApplication";
import { ApiApplicationStatus } from "../../models/apiApplication/types";
import EncryptType from "../../utils/EncryptType";

export default async function validApiUse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const apiKey = req.headers.authorization;
  const adminRequestKey = process.env.ADMIN_REQUEST_KEY!;

  // admin key로 들어온 경우 plain data로 전달
  if (apiKey === adminRequestKey) {
    req.headers["response-encrypt"] = EncryptType.PLAIN;
    return next();
  }

  if (!apiKey) {
    return res.status(403).json({
      status: false,
      error: {
        message: "권한이 없습니다.",
      },
    });
  }

  try {
    // 1. 신청서 조회
    const application = await ApiApplicationModel.findOne({
      where: {
        apiKey,
      },
    });

    // 신청서가 존재하지 않을 경우
    if (!application) {
      return res.status(403).json({
        status: false,
        error: {
          message: "권한이 없습니다.",
        },
      });
    }

    // 신청서가 허가가 안난 상태일 경우
    if (application.status === ApiApplicationStatus.inactive) {
      return res.status(403).json({
        status: false,
        error: {
          message: "권한이 없습니다.",
        },
      });
    }

    // 사용자 맞춤형 암호화를 위해 다음 라우터에 사용자 암호화 키 전달
    req.headers["response-encrypt"] = EncryptType.USER_SELF;
    req.decryptKey = application.decryptKey;
    return next();
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      status: false,
      error: {
        message: "시스템 오류입니다. 관리자에게 문의해주세요.",
      },
    });
  }
}

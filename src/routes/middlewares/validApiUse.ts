import { NextFunction, Request, Response } from "express";
import ApiApplicationModel from "../../models/apiApplication";
import { ApiApplicationStatus } from "../../models/apiApplication/types";
import EncryptType from "../../utils/EncryptType";
import ResponseError from "../../utils/ResponseError";

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
    return next(new ResponseError("API KEY가 필요한 서비스입니다.", 401));
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
      return next(new ResponseError("신청 데이터가 존재하지 않습니다.", 401));
    }

    // 신청서가 허가가 안난 상태일 경우
    if (
      application.status === ApiApplicationStatus.INACTIVE ||
      application.status === ApiApplicationStatus.WAITING
    ) {
      return next(
        new ResponseError("관리자 승인이 이루어지지 않았습니다.", 401)
      );
    }

    // 사용자 맞춤형 암호화를 위해 다음 라우터에 사용자 암호화 키 전달
    req.headers["response-encrypt"] = EncryptType.USER_SELF;
    req.symmetricKey = application.symmetricKey;
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

import { NextFunction, Request, Response } from "express";
import ResponseError from "../../utils/ResponseError";

export default function ResponseErrorHandler(
  err: ResponseError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.statusCode || 500;
  const message =
    status === 500
      ? "시스템 오류입니다. 관리자에게 문의해주세요."
      : err.message;

  return res.status(status).json({
    status: false,
    error: {
      message,
    },
  });
}

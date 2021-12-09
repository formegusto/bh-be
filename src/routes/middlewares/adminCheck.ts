import { NextFunction, Request, Response } from "express";

export default function adminCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const key = req.headers.authorization;

  if (!key) {
    return res.status(401).json({
      status: false,
      error: {
        message: "권한이 없습니다.",
      },
    });
  }

  const adminRequestKey = process.env.ADMIN_REQUEST_KEY;
  if (key !== adminRequestKey) {
    return res.status(401).json({
      status: false,
      error: {
        message: "권한이 없습니다.",
      },
    });
  }

  return next();
}

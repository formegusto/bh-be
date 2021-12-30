import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import SessionCertModel from "../../models/sessionCert";
import UserModel from "../../models/user";
import { decryptProcess } from "../../utils/ARIAUtils";
import ResponseError from "../../utils/ResponseError";
import { DecodedUser } from "../user/types";

export async function loginCheck(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const secret = process.env.JWT_SECRET!;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return next(new ResponseError("인증이 필요한 서비스입니다.", 401));
    }
    console.log("token", token);

    const adminRequestKey = process.env.ADMIN_REQUEST_KEY;
    if (adminRequestKey === token) {
      return next();
    }

    const { username, role } = <DecodedUser>jwt.verify(token, secret);
    console.log(username, role);
    const user = await UserModel.findOne({
      where: {
        username,
      },
      attributes: ["id", "username", "role"],
    });
    if (!user) return next(new ResponseError("잘못된 토큰 입니다.", 401));
    req.loginUser = user.get({ plain: true });

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: {
        message: "시스템 오류 입니다. 관리자에게 문의하세요.",
      },
    });
  }
}

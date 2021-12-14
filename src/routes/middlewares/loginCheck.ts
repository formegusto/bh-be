import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import UserModel from "../../models/user";
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
      return res.status(401).json({
        status: false,
        error: {
          message: "인증이 필요한 서비스입니다.",
        },
      });
    }
    console.log("token", token);

    const { username, role } = <DecodedUser>jwt.verify(token, secret);
    const user = await UserModel.findOne({
      where: {
        username,
        role,
      },
      attributes: ["id", "username", "role"],
    });
    if (!user) {
      return res.status(401).json({
        status: false,
        error: {
          message: "잘못된 토큰입니다.",
        },
      });
    }

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

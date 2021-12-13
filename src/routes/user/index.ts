import { Request, Response, Router } from "express";
import UserModel from "../../models/user";
import { RequestUserBody } from "./types";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { loginCheck } from "../middlewares/loginCheck";
import { requestBodyEncrypt } from "../../utils/ARIAUtils";

const UserRoutes = Router();

UserRoutes.post("/", async (req: Request, res: Response) => {
  const body = <RequestUserBody>req.body;
  // front server와 복호화 과정이 붙어야 함.

  try {
    const isExist = await UserModel.findOne({
      where: {
        username: body.username,
      },
    });

    if (isExist) {
      return res.status(400).json({
        status: false,
        error: {
          message: "이미 존재하는 계정입니다.",
        },
      });
    }

    body.password = await bcrypt.hash(body.password, 10);
    const { id } = await UserModel.create(body);
    if (id) {
      const user = await UserModel.findByPk(id, {
        attributes: ["username", "role"],
      });
      if (user) {
        const token = await jwt.sign(
          user?.get({ plain: true }),
          process.env.JWT_SECRET!,
          {
            expiresIn: "3h",
          }
        );

        return res.status(201).json({
          status: true,
          token,
        });
      }
    }
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: {
        message: "시스템 오류입니다. 관리자에게 문의해주세요.",
      },
    });
  }
});

UserRoutes.get("/check", loginCheck, async (req: Request, res: Response) => {
  const { id } = req.loginUser as any;
  const user = await UserModel.findByPk(id, {
    attributes: {
      exclude: ["id"],
    },
  });

  const plainUser = user?.get({ plain: true });
  console.log(plainUser);

  // community decrypt
  const communityKey = process.env.COMMUNITY_KEY!;
  requestBodyEncrypt(plainUser, communityKey, ["password"]);
  console.log(plainUser);

  return res.status(200).json({
    status: true,
    user: plainUser,
  });
});

export default UserRoutes;

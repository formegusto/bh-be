import { NextFunction, Request, Response, Router } from "express";
import UserModel from "../../models/user";
import { RequestSignInBody, RequestSignUpBody } from "./types";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { loginCheck } from "../middlewares/loginCheck";
import ResponseError from "../../utils/ResponseError";

const UserRoutes = Router();

UserRoutes.post(
  "/signin",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <RequestSignInBody>req.body;

    try {
      const user = await UserModel.findOne({
        where: {
          username: body.username,
        },
      });

      if (user) {
        const hashCheck = await bcrypt.compare(body.password, user.password);

        if (hashCheck) {
          const token = await jwt.sign(
            {
              id: user.id,
              username: user.username,
              role: user.role,
            },
            process.env.JWT_SECRET!,
            {
              expiresIn: "3h",
            }
          );

          res.custom = {
            status: 200,
            body: {
              status: true,
              token,
            },
          };

          return next();
        } else {
          return next(new ResponseError("잘못된 로그인 정보입니다.", 401));
        }
      } else {
        return next(new ResponseError("잘못된 로그인 정보입니다.", 401));
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
  }
);

UserRoutes.post(
  "/signup",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <RequestSignUpBody>req.body;

    try {
      const isExist = await UserModel.findOne({
        where: {
          username: body.username,
        },
      });

      if (isExist) {
        const token = await jwt.sign(
          {
            id: isExist.id,
            username: isExist.username,
            role: isExist.role,
          },
          process.env.JWT_SECRET!,
          {
            expiresIn: "3h",
          }
        );

        res.custom = {
          status: 201,
          body: {
            status: true,
            token,
          },
        };

        return next();
        // return res.status(400).json({
        //   status: false,
        //   error: {
        //     message: "이미 존재하는 계정입니다.",
        //   },
        // });
      }

      body.password = await bcrypt.hash(body.password, 10);

      const { id } = await UserModel.create(body);
      if (id) {
        const user = await UserModel.findByPk(id, {
          attributes: ["username", "role"],
        });
        if (user) {
          const token = await jwt.sign(
            {
              id: user.id,
              username: user.username,
              rol: user.role,
            },
            process.env.JWT_SECRET!,
            {
              expiresIn: "3h",
            }
          );

          res.custom = {
            status: 201,
            body: {
              status: true,
              token,
            },
          };

          return next();
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
  }
);

UserRoutes.get(
  "/check",
  loginCheck,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.loginUser as any;
    const user = await UserModel.findByPk(id, {
      attributes: {
        include: ["id", "username", "role"],
      },
    });
    if (user) {
      const { id, username, role } = user.get({ plain: true });
      res.custom = {
        status: 200,
        body: {
          status: true,
          user: {
            id,
            username,
            role,
          },
        },
      };
      return next();
    } else {
      return next(new ResponseError("존재하지 않는 정보입니다.", 403));
    }
  }
);

export default UserRoutes;

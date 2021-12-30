import { NextFunction, Request, Response, Router } from "express";
import UserModel from "../../../models/user";
import ResponseError from "../../../utils/ResponseError";
import { GetUsersResponse, PatchUserRequest, UserQuery } from "./types";

const UserRoutes = Router();

UserRoutes.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const query = <UserQuery>req.query;

  try {
    const currentPage = query.offset ? query.offset - 1 : 1;

    const limit = 10;
    const offset = 10 * (currentPage - 1);

    console.log(query);
    console.log(currentPage, limit, offset);

    const users = await UserModel.findAll({
      limit,
      offset,
    });
    const count = await UserModel.count();

    const lastPage = count === 0 ? 1 : Math.floor((count - 1) / 10) + 1;

    const resUsers: GetUsersResponse = {
      currentPage,
      lastPage,
      count,
      users,
    };

    res.custom = {
      status: 200,
      body: {
        ...resUsers,
      },
    };

    return next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: {
        message: "시스템 오류 입니다. 관리자에게 문의해주세요.",
      },
    });
  }
});

UserRoutes.patch(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    try {
      const user = await UserModel.findByPk(userId);

      if (user) {
        const body = <PatchUserRequest>req.body;
        await user.update(body);

        res.custom = {
          status: 200,
          body: {
            status: true,
            success: {
              message: "성공적으로 수정되었습니니다.",
            },
          },
        };
        return next();
      } else {
        return next(new ResponseError("존재하지 않는 사용자 입니다.", 404));
      }
    } catch (err) {
      return res.status(500).json({
        status: false,
        error: {
          message: "시스템 오류 입니다. 관리자에게 문의해주세요.",
        },
      });
    }
  }
);

export default UserRoutes;

import { NextFunction, Request, Response, Router } from "express";
import ApiApplicationModel from "../../../models/apiApplication";
import { ApiApplicationStatus } from "../../../models/apiApplication/types";
import UserModel from "../../../models/user";
import {
  requestBodyDecrypt,
  requestBodyEncrypt,
} from "../../../utils/ARIAUtils";
import ResponseError from "../../../utils/ResponseError";
import {
  ApiApplicationQuery,
  GetApplicationsResponse,
  PatchApplicationRequest,
} from "./types";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const query = <ApiApplicationQuery>req.query;

    try {
      const currentPage = query.offset ? query.offset - 1 : 1;

      const limit = 10;
      const offset = 10 * (currentPage - 1);

      console.log(query);
      console.log(currentPage, limit, offset);

      const applications = await ApiApplicationModel.findAll({
        limit,
        offset,
        include: [
          {
            model: UserModel,
            as: "user",
            attributes: ["username"],
          },
        ],
      });

      const count = await ApiApplicationModel.count();

      const lastPage = count === 0 ? 1 : Math.floor((count - 1) / 10) + 1;
      const resApplications: GetApplicationsResponse = {
        currentPage,
        lastPage,
        count,
        applications,
      };

      res.custom = {
        status: 200,
        body: {
          ...resApplications,
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
  }
);

ApiApplicationRoutes.patch(
  "/:appId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { appId } = req.params;
    try {
      const app = await ApiApplicationModel.findByPk(appId);

      if (app) {
        const body = <PatchApplicationRequest>req.body;
        await app.update(body);

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
        return next(new ResponseError("존재하지 않는 신청서 입니다.", 404));
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

ApiApplicationRoutes.patch(
  "/confirm",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <any>req.body;

    const { id } = body;
    console.log("confirm", id);

    const [_, _2] = await ApiApplicationModel.update(
      {
        status: ApiApplicationStatus.ACTIVE,
      },
      {
        where: {
          id,
        },
      }
    );

    const application = await ApiApplicationModel.findByPk(id);
    const plainApplication = application?.get({ plain: true });

    res.custom = {
      status: 200,
      body: {
        status: true,
        application: plainApplication,
      },
    };

    return next();
  }
);

export default ApiApplicationRoutes;

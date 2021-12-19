import { NextFunction, Request, Response, Router } from "express";
import ApiApplicationModel from "../../../models/apiApplication";
import { ApiApplicationStatus } from "../../../models/apiApplication/types";
import {
  requestBodyDecrypt,
  requestBodyEncrypt,
} from "../../../utils/ARIAUtils";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.patch(
  "/confirm",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <any>req.body;

    const { id } = body;
    console.log("confirm", id);

    const [_, _2] = await ApiApplicationModel.update(
      {
        status: ApiApplicationStatus.active,
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

import { NextFunction, Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { ApiApplicationType, RequestApiApplication } from "./types";
import ApiApplicationModel from "../../models/apiApplication";
import { requestBodyDecrypt, requestBodyEncrypt } from "../../utils/ARIAUtils";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.post(
  "/apply",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <RequestApiApplication>req.body;
    const { id, username } = req.loginUser!;

    try {
      const apiKeyInput = Array.from({ length: 10 }).reduce<string>(
        (acc) => acc + Math.random(),
        username
      );
      const symmetricKeyInput = Array.from({ length: 10 }).reduce<string>(
        (acc) => acc + Math.random(),
        username
      );

      const apiKey = await bcrypt.hash(apiKeyInput, 10);
      const symmetricKey = await bcrypt.hash(symmetricKeyInput, 10);

      const apiApplication: ApiApplicationType = {
        ...body,
        apiKey: apiKey.slice(7, 7 + 32),
        symmetricKey: symmetricKey.slice(7, 7 + 32),
        userId: id,
      };

      const application = await ApiApplicationModel.create({
        ...apiApplication,
      });
      const plainApplication = application.get({ plain: true });
      res.custom = {
        status: 201,
        body: {
          status: true,
          application: plainApplication,
        },
      };
      return next();
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

export default ApiApplicationRoutes;

import { NextFunction, Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { ApiApplicationType, RequestApiApplication } from "./types";
import ApiApplicationModel from "../../models/apiApplication";
import ResponseError from "../../utils/ResponseError";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.post(
  "/apply",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <RequestApiApplication>req.body;
    const { id: userId, username } = req.loginUser!;

    try {
      const isAlready = await ApiApplicationModel.findOne({
        where: {
          userId,
        },
      });

      if (isAlready) {
        return next(
          new ResponseError(
            "이미 API 신청을 진행하셨습니다. 관리자 승인을 기다려주세요.",
            400
          )
        );
      }

      const apiKeyInput = Array.from({ length: 10 }).reduce<string>(
        (acc) => acc + Math.random(),
        username
      );
      const symmetricKeyInput = Array.from({ length: 10 }).reduce<string>(
        (acc) => acc + Math.random(),
        username
      );

      const newApiKey = await bcrypt.hash(apiKeyInput, 10);
      const newSymmetricKey = await bcrypt.hash(symmetricKeyInput, 10);

      const apiApplication: ApiApplicationType = {
        ...body,
        apiKey: newApiKey.slice(7, 7 + 32),
        symmetricKey: newSymmetricKey.slice(7, 7 + 32),
        userId: userId,
      };

      const application = await ApiApplicationModel.create({
        ...apiApplication,
      });
      const { id, status, purpose, apiKey, symmetricKey } = application.get({
        plain: true,
      });
      res.custom = {
        status: 201,
        body: {
          status: true,
          apiApplication: {
            id,
            status,
            purpose,
            apiKey,
            symmetricKey,
          },
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

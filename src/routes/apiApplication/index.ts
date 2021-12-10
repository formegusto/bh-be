import { Request, Response, Router } from "express";
import bcrypt from "bcrypt";
import { ApiApplicationType, RequestApiApplication } from "./types";
import ApiApplicationModel from "../../models/apiApplication";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.post("/apply", async (req: Request, res: Response) => {
  const body = <RequestApiApplication>req.body;
  const { id, username } = req.loginUser!;

  try {
    const apiKeyInput = Array.from({ length: 10 }).reduce<string>(
      (acc) => acc + Math.random(),
      username
    );
    const decryptKeyInput = Array.from({ length: 10 }).reduce<string>(
      (acc) => acc + Math.random(),
      username
    );

    const apiKey = await bcrypt.hash(apiKeyInput, 10);
    const decryptKey = await bcrypt.hash(decryptKeyInput, 10);

    const apiApplication: ApiApplicationType = {
      ...body,
      apiKey: apiKey.slice(7, 7 + 32),
      decryptKey: decryptKey.slice(7, 7 + 32),
      userId: id,
    };

    const application = await ApiApplicationModel.create({
      ...apiApplication,
    });

    return res.status(201).json({
      status: true,
      application,
    });
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

export default ApiApplicationRoutes;
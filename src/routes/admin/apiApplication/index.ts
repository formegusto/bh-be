import { Request, Response, Router } from "express";
import ApiApplicationModel from "../../../models/apiApplication";
import { ApiApplicationStatus } from "../../../models/apiApplication/types";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.patch("/confirm", async (req: Request, res: Response) => {
  const { id } = <any>req.body;

  console.log("confirm", id);

  try {
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

    return res.status(200).json({
      status: true,
      application,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      error: {
        message: "시스템 오류 입니다. 관리자에게 문의 해주세요.",
      },
    });
  }
});

export default ApiApplicationRoutes;

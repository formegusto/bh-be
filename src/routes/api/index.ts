import { Request, Response, Router } from "express";
import BuildingModel from "../../models/building";
import SensorModel from "../../models/sensor";

const ApiRoutes = Router();

ApiRoutes.get("/humanData", async (req: Request, res: Response) => {
  const humanDatas = await BuildingModel.findAll({
    raw: true,
    nest: true,
    include: [
      {
        model: SensorModel,
      },
    ],
  });

  console.log(humanDatas);

  return res.status(200).json({
    status: true,
    humanDatas,
  });
});

export default ApiRoutes;

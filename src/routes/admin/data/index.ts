import { NextFunction, Request, Response, Router } from "express";
import { Model, ModelStatic } from "sequelize/dist";
import ResponseError from "../../../utils/ResponseError";
import { informationMap } from "../../api/commonDatas";
import { TARGET, TARGET_MODEL } from "./types";

const DataRoutes = Router();

/*
    target : building, ENUM TARGET
    rootId : 
        unit 조회 시, building Id
        sensor 조회 시, unit Id
*/

// building
DataRoutes.get(
  "/:target",
  async (req: Request, res: Response, next: NextFunction) => {
    const { target } = req.params;

    if (target === TARGET.UNIT || target === TARGET.SENSOR) {
      return next(
        new ResponseError(
          `분류 ${target}은 해당 라우터를 지원하지 않습니다.`,
          400
        )
      );
    }

    const model = TARGET_MODEL[target];
    const data = await model.findAll();

    res.custom = {
      status: 200,
      body: {
        status: true,
        target,
        data,
      },
    };

    return next();
  }
);

// unit, sensor
DataRoutes.get(
  "/:target/:rootId",
  async (req: Request, res: Response, next: NextFunction) => {
    const { target, rootId } = req.params;

    if (target === TARGET.BUILDING) {
      return next(
        new ResponseError("건물 조회는 해당 라우터를 지원하지 않습니다.", 400)
      );
    }

    const model = TARGET_MODEL[target];
    const where: { [key: string]: any } = {};

    let include;

    switch (target) {
      case TARGET.UNIT:
        where["buildingId"] = rootId;
        break;
      case TARGET.SENSOR:
        where["unitId"] = rootId;
        break;
      case TARGET.REPORT:
        where["sensorId"] = rootId;
        include = Object.entries(informationMap).map(([k, v]) => ({
          model: v,
          as: k,
          attributes: ["value"],
        }));
        break;
    }

    const data = await model.findAll({
      where,
      include,
    });
    const plainData = data.map((d: any) => ({
      ...d.get({ plain: true }),
    }));

    if (target === TARGET.REPORT) {
      plainData.forEach((p: any) => {
        Object.keys(p).forEach((k) => {
          if (p[k] === null) delete p[k];
        });
      });
    }

    res.custom = {
      status: 200,
      body: {
        status: true,
        target,
        data: plainData,
      },
    };

    return next();
  }
);

DataRoutes.post("/:target/:id", (req: Request, res: Response) => {});
DataRoutes.patch("/:target/:id", (req: Request, res: Response) => {});
DataRoutes.delete("/:target/:id", (req: Request, res: Response) => {});

export default DataRoutes;

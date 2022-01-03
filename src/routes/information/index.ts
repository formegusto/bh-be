import { NextFunction, Request, Response, Router } from "express";
import { informationMap } from "../../models/information/models";
import SensorReportTimeModel from "../../models/sensorReportTime";
import ResponseError from "../../utils/ResponseError";
import { TARGET, TARGET_MODEL } from "../admin/data/types";
import { includeColums } from "../api/commonDatas";

const InfoRoutes = Router();

InfoRoutes.get(
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
InfoRoutes.get(
  "/:target/:rootId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
          include = [
            {
              model: SensorReportTimeModel,
              as: "timeReports",
              attributes: ["createdAt"],
              order: [["createdAt", "DESC"]],
              include: Object.entries(informationMap).map(([k, v]) => ({
                model: v,
                as: k,
                attributes: ["value"],
              })),
              limit: 10,
            },
          ];

          break;
      }

      const data = await model.findAll({
        where,
        include,
      });
      const plainData = data.map((d: any) => ({
        ...d.get({ plain: true }),
      }));
      if (target === TARGET.SENSOR) {
        plainData.forEach((p: any) => {
          const tr = p["timeReports"];
          tr.forEach((r: any) => {
            Object.keys(r).forEach((k: any) => {
              if (includeColums.includes(k)) {
                if (!r[k]) delete r[k];
                else r[k] = r[k]["value"];
              }
            });
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
    } catch (err) {
      console.error(err);

      return next(
        new ResponseError("시스템 오류입니다. 관리자에게 문의해주세요.", 500)
      );
    }
  }
);

export default InfoRoutes;

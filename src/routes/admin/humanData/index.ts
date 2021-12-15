import { NextFunction, Request, response, Response, Router } from "express";
import BuildingModel from "../../../models/building";
import SensorModel from "../../../models/sensor";
import {
  requestBodyDecrypt,
  requestBodyEncrypt,
} from "../../../utils/ARIAUtils";
import { HumanDataBody } from "./types";

const HumanDataRoutes = Router();

HumanDataRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = <HumanDataBody>req.body;

      const [building, buildingResult] = await BuildingModel.findCreateFind({
        where: {
          ...body.building,
        },
      });
      // console.log(building);

      const [sensor, sensorResult] = await SensorModel.findCreateFind({
        where: {
          ...body.sensor,
          buildingId: building.id,
        },
      });
      // console.log(sensor);

      const report = await sensor.createTimeReport({});

      const information: { [key: string]: any } = {};
      const infoKeys = Object.keys(body.information);

      for (let i = 0; i < infoKeys.length; i++) {
        const info = await report[
          `create${infoKeys[i][0].toUpperCase() + infoKeys[i].slice(1)}`
        ]({
          value: body.information[infoKeys[i]],
        });
        information[infoKeys[i]] = info.get({ plain: true }).value;
      }

      const responseBody = {
        building: {
          ...building.get({ plain: true }),
        },
        sensor: {
          ...sensor.get({ plain: true }),
        },
        sensorReportTime: {
          ...report.get({ plain: true }),
        },
        information: {
          ...information,
        },
      };

      res.custom = {
        status: 201,
        body: {
          status: true,
          ...responseBody,
        },
      };

      return next();
    } catch (err: any) {
      return res.status(500).json({
        status: false,
        error: {
          message: err.message,
        },
      });
    }
  }
);

export default HumanDataRoutes;

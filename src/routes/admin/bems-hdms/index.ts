import { NextFunction, Request, response, Response, Router } from "express";
import BuildingModel from "../../../models/building";
import SensorModel from "../../../models/sensor";
import UnitModel from "../../../models/unit";
import { HumanDataBody } from "./types";

const BEMSHDMSRoutes = Router();

BEMSHDMSRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    const body = <HumanDataBody>req.body;
    console.log(body);

    const [building, buildingResult] = await BuildingModel.findCreateFind({
      where: {
        name: body.building,
      },
    });
    // console.log(building);

    const [unit, unitResult] = await UnitModel.findCreateFind({
      where: {
        name: body.unit,
        buildingId: building.id,
      },
    });
    // console.log(unit);

    const [sensor, sensorResult] = await SensorModel.findCreateFind({
      where: {
        name: body.sensor,
        unitId: unit.id,
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
      unit: {
        ...unit.get({ plain: true }),
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
  }
);

export default BEMSHDMSRoutes;

import { Request, Response, Router } from "express";
import { Model } from "sequelize/dist";
import BuildingModel from "../../../models/building";
import InformationModel from "../../../models/information";
import {
  informationMap,
  informationNames,
} from "../../../models/information/models";
import SensorModel from "../../../models/sensor";
import ARIAEngine from "../../../utils/ARIAEngine";
import {
  bytesToString,
  decryptProcess,
  encryptProcess,
  stringToByte,
} from "../../../utils/ARIAUtils";
import { HumanDataBody } from "./types";

const HumanDataRoutes = Router();

HumanDataRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const body = <HumanDataBody>req.body;

    console.log(body);

    const [building, buildingResult] = await BuildingModel.findCreateFind({
      where: {
        ...body.building,
      },
    });
    console.log(building);

    const [sensor, sensorResult] = await SensorModel.findCreateFind({
      where: {
        ...body.sensor,
        buildingId: building.id,
      },
    });
    console.log(sensor);

    const report = await sensor.createTimeReport({
      time: new Date(),
    });

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

    return res.status(201).json({
      status: true,
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
    });
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      error: {
        message: err.message,
      },
    });
  }
});

export default HumanDataRoutes;

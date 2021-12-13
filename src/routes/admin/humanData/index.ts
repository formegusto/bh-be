import { Request, response, Response, Router } from "express";
import BuildingModel from "../../../models/building";
import SensorModel from "../../../models/sensor";
import {
  requestBodyDecrypt,
  requestBodyEncrypt,
} from "../../../utils/ARIAUtils";
import { HumanDataBody } from "./types";

const HumanDataRoutes = Router();

function bodyDecrypt(encryptBody: HumanDataBody) {}

HumanDataRoutes.post("/", async (req: Request, res: Response) => {
  try {
    const body = <HumanDataBody>req.body;
    console.log("----- request -----");
    console.log(body);

    requestBodyDecrypt(body);
    console.log("----- decrypt request -----");
    console.log(body);
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
    console.log("---- response ----");
    console.log(responseBody);

    requestBodyEncrypt(responseBody, process.env.COMMUNITY_KEY!);

    console.log("---- encrypt response ----");
    console.log(responseBody);
    return res.status(201).json({
      status: true,
      ...responseBody,
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

HumanDataRoutes.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    status: true,
    data: {},
  });
});

export default HumanDataRoutes;

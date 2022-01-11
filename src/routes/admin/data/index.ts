import { NextFunction, Request, Response, Router } from "express";
import ResponseError from "../../../utils/ResponseError";
import { includeColums, informationMap } from "../../api/commonDatas";
import { POST_OR_PATCH_BODY, TARGET, TARGET_MODEL } from "./types";
import multer from "multer";
import path from "path";
import BuildingModel from "../../../models/building";
import UnitModel from "../../../models/unit";
import fs from "fs";
import SessionCertModel from "../../../models/sessionCert";
import { decryptProcess } from "../../../utils/ARIAUtils";

const DataRoutes = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/building");
  },
  filename: (req, file, cb) => {
    cb(null, `building-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
});
const singleFile = upload.single("image");

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
    const option: { [key: string]: any } = {};

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
        option.order = [["createdAt", "DESC"]];
        option.attributes = ["createdAt"];

        break;
    }

    const data = await model.findAll({
      where,
      include,
      ...option,
    });
    const plainData = data.map((d: any) => ({
      ...d.get({ plain: true }),
    }));

    if (target === TARGET.REPORT) {
      plainData.forEach((p: any) => {
        Object.keys(p).forEach((k: any) => {
          if (includeColums.includes(k)) {
            if (!p[k]) delete p[k];
            else p[k] = p[k]["value"];
          }
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

DataRoutes.post(
  "/:target",
  singleFile,
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.isRequiredDecrypt && req.body.name) {
      const certId = req.headers["session-cert-id"];
      const sessionCert = await SessionCertModel.findByPk(certId as any);
      const decryptKey = sessionCert?.symmetricKey;

      req.body.name = decryptProcess(req.body.name, decryptKey);
    }

    try {
      const { target } = req.params;

      const model = TARGET_MODEL[target];
      let body = <POST_OR_PATCH_BODY>req.body;
      const file = req.file;

      const isExist = await model.findOne({
        where: body,
      });
      if (isExist)
        return next(
          new ResponseError(`이미 같은 이름의 ${target}이(가) 존재합니다.`, 400)
        );

      switch (target) {
        case TARGET.UNIT:
          const buildingExist = await BuildingModel.findOne({
            where: {
              id: body.buildingId,
            },
          });
          if (!buildingExist)
            return next(
              new ResponseError("존재하지 않는 '건물'의 번호입니다.", 400)
            );
          break;
        case TARGET.SENSOR:
          const unitExist = await UnitModel.findOne({
            where: {
              id: body.unitId,
            },
          });
          if (!unitExist)
            return next(
              new ResponseError("존재하지 않는 '호'의 번호입니다.", 400)
            );
          break;
        case TARGET.BUILDING:
          if (file) {
            const staticPath = process.env.FILE_PATH_ROOT!;
            const image = path.join(staticPath, target, file.filename);

            body["image"] = "/" + image;
          }
          break;
      }

      const createData = await model.create(body);
      res.custom = {
        status: 201,
        body: {
          status: true,
          target,
          createData,
        },
      };

      return next();
    } catch (err) {
      console.error(err);

      return next(
        new ResponseError("시스템 오류 입니다. 관리자에게 문의해주세요.", 500)
      );
    }
  }
);

DataRoutes.patch(
  "/:target/:id",
  singleFile,
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.isRequiredDecrypt && req.body.name) {
      console.log(req.body);
      const certId = req.headers["session-cert-id"];
      const sessionCert = await SessionCertModel.findByPk(certId as any);
      const decryptKey = sessionCert?.symmetricKey;

      console.log(decryptKey);
      req.body.name = decryptProcess(req.body.name, decryptKey);
      console.log(req.body);
    }

    try {
      const { target, id } = req.params;
      const model = TARGET_MODEL[target];
      const body = <POST_OR_PATCH_BODY>req.body;
      const file = req.file;

      const isExist = await model.findOne({
        where: {
          id,
        },
      });
      if (!isExist)
        return next(new ResponseError(`존재하지 않는 ${target} 입니다.`, 400));

      switch (target) {
        case TARGET.SENSOR:
        case TARGET.UNIT:
          if (body.unitId) delete body.unitId;
          if (body.buildingId) delete body.buildingId;
          break;
        case TARGET.BUILDING:
          if (file) {
            // 파일이있으면 기존 파일은 날리고,
            // 새로 들어온 친구를 DB에 넣어줘야 함.
            const { image } = isExist;

            if (image) {
              try {
                const absPath = path.join(
                  process.env.PWD!,
                  image.replace("/static", process.env.PUBLIC_PATH!)
                );
                fs.readFileSync(absPath);

                fs.unlinkSync(absPath);
              } catch (err) {
                console.log("파일 없나봄 걍 진행하셈");
              }
            }

            const staticPath = process.env.FILE_PATH_ROOT!;
            body.image = "/" + path.join(staticPath, target, file.filename);
          }

          break;
      }

      await model.update(body, {
        where: {
          id,
        },
      });
      const updateData = await model.findOne({
        where: {
          id,
        },
      });

      res.custom = {
        status: 200,

        body: {
          status: true,
          target,
          updateData,
        },
      };

      return next();
    } catch (err) {
      console.error(err);

      return next(
        new ResponseError("시스템 오류 입니다. 관리자에게 문의해주세요.", 500)
      );
    }
  }
);

DataRoutes.delete("/:target/:id", (req: Request, res: Response) => {});

export default DataRoutes;

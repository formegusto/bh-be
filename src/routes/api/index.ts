import { NextFunction, Request, Response, Router } from "express";
import moment from "moment";
import { Op } from "sequelize/dist";
import BuildingModel from "../../models/building";
import InformationModel from "../../models/information";
import { informationModels } from "../../models/information/models";
import SensorModel from "../../models/sensor";
import SensorReportTimeModel from "../../models/sensorReportTime";
import UnitModel from "../../models/unit";
import {
  getModelAsByModel,
  getModelsByExcludeColumns,
  getModelsByIncludeColumns,
} from "../../utils/DataProcessUtils";
import ResponseError from "../../utils/ResponseError";
import { RequestBEMSApi } from "./types";

const ApiRoutes = Router();

/*
Query Parameter Plan
  include: 포함 모델 목록 ( 기본값 = all )
    example : all,isStay,residentCount,temperature,humidity,lux,skinTemperature,residentDistribution,satisfaction
  exclude: 제외 모델 목록 ( 기본값 = none )
    comment: 포함 모델 목록("include") 쿼리가 존재할 경우 우선순위는 포함 모델 목록 쿼리. 두 개의 쿼리는 같이 동작할 수 없음.

  // 수집 시간 관련 option
    comment : ISO 8601 Based YYYY-MM-DDThh:mm
  stardDate: 요청하고자 하는 수집 데이터의 시작 시간 ( 공백일 경우, 마지막 수집 시간으로부터 7week 전 default )
  endDate: 요청하고자 하는 수집 데이터의 끝 시간 ( 공백일 경우, 7week default )
    comment : startDate ~ endDate 까지의 데이터 요청
  interval: 시작 시간으로부터 제일 첫 번째 수집 데이터의 시간으로부터 수집 시간 간격으로 데이터 파싱
    ( 공백일 경우, 전체데이터 반영 )
    comment:
      0. 형식 :
        [숫자][시간타입]
        시간타입:
          초(s), 분(m), 시(h), 일(d)
        예시:
          15s - 시작시간으로부터 제일 첫 번째 수집 데이터의 시간으로 부터 15초 간격으로 데이터 파싱
      1. 문제점 : 센서와 서버간의 통신상 오류 및 센서와 서버 자체의 오류로 정확한 시간 간격 수집이 이루어지지 않을 수 있음.
         해결 : 사용자가 보내온 시간 간격으로부터 다음 간격의 데이터를 파싱할 때, 배열 간격으로 파싱한다. 이 때, 가장 나중에 위치해 있는 데이터를 파싱
         에시:
          startDate의 시간대를 3시부터 설정했을 때, 15초 간격으로 수집데이터를 파싱할 때,
          3시 00분이 가장 첫번째 데이터라고 쳤을 때,
          다음 3시 15분 까지의 데이터들을 가지고 온 후,
          정확하게 3시 15분의 데이터가 존재하지 않는다면,
            현재까지의 15분 시간대의 가장 마지막 데이터와
            다음 15분 시간대의 가장 최근 데이터의 시간을 비교한 후, 가장 15분에 가까운 데이터를 파싱시킨다.
         우선은 초(sec) 단위만 생각을 하면서 개발
  limit: 몇 개의 수집 데이터를 가지고 올 것인가 ( 해당 건물의 센서들의 레포트시간을 기준으로 한다. )
    comment:
      해당 서비스의 사용자들은 동적인 서비스에서 사용하는 케이스는 적을 것이라고 예상한다.
      때문에, default 값은 없는 것으로 정해놓겠다.
  offset: limit 설정이 되어 있을 경우에만 동작한다. ( limit간격으로 페이지 단위 )

  smartOption: 아직 서비스에 넣기는 애매한 시도적인 옵션들을 넣는 나의 창작공간. 
    [개발자의 주관적인 개념이 많이 껴 있기 때문에 사용자의 선택으로 남기는 옵션]
    - season : 계절 파싱

    - at : 시간대 파싱
      noon(정오), dusk(황혼), night(밤), midnight(자정), dawn(새벽)
      morning(아침), afternoon(오후), evening(저녁, 밤), daytime(낮에)
*/
ApiRoutes.get(
  "/bems-hdms",
  async (req: Request, res: Response, next: NextFunction) => {
    const query = <RequestBEMSApi>req.query;

    console.log("\n\n-----query-----");
    console.log(query);

    const { include, exclude, startDate, endDate } = query;
    // 1. 모델 파싱 (include, exclude query control)
    // -1. include parsing
    let infos: InformationModel[] = include
      ? getModelsByIncludeColumns(include.split(","))
      : informationModels;
    // -2. exclude parsing ( include query 존재할 경우 동작하지 않는다. )
    if (!include) {
      if (exclude) {
        infos = getModelsByExcludeColumns(exclude.split(","));
      }
    }
    console.log("\n\n-----setting information model okay-----");
    console.log(infos);

    // 2. startDate parsing
    console.log("\n\n-----start date setting-----");
    let startDateObject: moment.Moment | undefined;
    if (startDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )
      startDateObject = moment(startDate);
    } else {
      startDateObject = moment().subtract(7, "day");
    }

    if (!startDateObject.isValid()) {
      return next(
        new ResponseError("startDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    console.log("start date object:", startDateObject);

    // 4. endDate parsing
    console.log("\n\n-----end date setting-----");
    let endDateObject: moment.Moment | undefined;
    if (endDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )

      endDateObject = moment(endDate);
    } else {
      endDateObject = moment(startDateObject).add(7, "d");
    }

    if (!endDateObject.isValid()) {
      return next(
        new ResponseError("endDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    if (!endDateObject.isAfter(startDateObject)) {
      return next(
        new ResponseError(
          "endDate는 startDate 보다 작거나 같을 수 없습니다.",
          400
        )
      );
    }

    // 3. convert to includabletype
    console.log("\n\n-----infos convert to includabletype-----");
    const asList = infos.reduce<any>(
      (acc, cur) => acc.concat(getModelAsByModel(cur)),
      []
    );
    const infosIncludable = infos.reduce<any>(
      (acc, cur) =>
        acc.concat({
          model: cur,
          as: getModelAsByModel(cur),
          attributes: ["value"],
        }),
      []
    );
    console.log(infosIncludable);

    // 4. condition init
    // reportTime
    const whereReportTime = {
      createdAt: {
        [Op.and]: [
          {
            [Op.gte]: startDateObject.toDate(),
          },
          {
            [Op.lte]: endDateObject.toDate(),
          },
        ],
      },
    };

    const humanDatas = await BuildingModel.findAll({
      // raw: true,
      // nest: true,
      attributes: {
        exclude: ["createdAt", "updatedAt", "image"],
      },
      include: [
        {
          model: UnitModel,
          as: "units",
          required: true,
          attributes: {
            exclude: ["createdAt", "updatedAt", "buildingId"],
          },
          include: [
            {
              model: SensorModel,
              as: "sensors",
              required: true,
              attributes: {
                exclude: ["createdAt", "updatedAt", "unitId"],
              },
              include: [
                {
                  model: SensorReportTimeModel,
                  as: "timeReports",
                  include: infosIncludable,
                  required: true,
                  where: whereReportTime,
                  attributes: ["createdAt"],
                },
              ],
            },
          ],
        },
      ],
    });

    const plainHumanDatas = [];
    for (let building of humanDatas) {
      const plainBuilding = building.get({ plain: true });

      const units = (plainBuilding as any).units;
      const newUnits = [];

      for (let unit of units) {
        const newSensors = [];
        const sensors = (unit as any).sensors;

        for (let sensor of sensors) {
          let isDelete: boolean = false;
          const timeReports = sensor.timeReports;
          for (let timeReport of timeReports) {
            // 비어 있는 아우터 조인 결과 제거
            Object.keys(timeReport).forEach((key) => {
              if (timeReport[key] === null) {
                delete timeReport[key];
              }
            });

            let includeCount = 0;
            Object.keys(timeReport).forEach((key) => {
              if (asList.includes(key)) {
                includeCount++;
                timeReport[key] = timeReport[key].value;
              }
            });

            if (includeCount === 0) {
              isDelete = true;
              break;
            }
          }

          if (!isDelete) {
            newSensors.push(sensor);
          }
        }
        if (newSensors.length !== 0) {
          (unit as any).sensors = newSensors;
          newUnits.push(unit);
        }
      }

      if (newUnits.length !== 0) {
        (plainBuilding as any).units = newUnits;
        plainHumanDatas.push(plainBuilding);
      }
    }

    res.custom = {
      status: 200,
      body: {
        status: true,
        query: Object.keys(query).length === 0 ? "none" : query,
        data: {
          buildings: plainHumanDatas,
        },
      },
    };

    return next();
  }
);

ApiRoutes.get(
  "/bems-hdms/:buildingId",
  async (req: Request, res: Response, next: NextFunction) => {
    const query = <RequestBEMSApi>req.query;
    const { buildingId } = req.params;

    console.log("\n\n-----query-----");
    console.log(query);

    const { include, exclude, startDate, endDate } = query;

    // 1. 모델 파싱 (include, exclude query control)
    // -1. include parsing
    let infos: InformationModel[] = include
      ? getModelsByIncludeColumns(include.split(","))
      : informationModels;
    // -2. exclude parsing ( include query 존재할 경우 동작하지 않는다. )
    if (!include) {
      if (exclude) {
        infos = getModelsByExcludeColumns(exclude.split(","));
      }
    }
    console.log("\n\n-----setting information model okay-----");
    console.log(infos);

    // 2. startDate parsing
    console.log("\n\n-----start date setting-----");
    let startDateObject: moment.Moment | undefined;
    if (startDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )

      startDateObject = moment(startDate);
    } else {
      startDateObject = moment().subtract(7, "day");
    }

    if (!startDateObject.isValid()) {
      return next(
        new ResponseError("startDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    console.log("start date object:", startDateObject);

    // 4. endDate parsing
    console.log("\n\n-----end date setting-----");
    let endDateObject: moment.Moment | undefined;
    if (endDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )

      endDateObject = moment(endDate);
    } else {
      endDateObject = moment(startDateObject).add(7, "d");
    }

    if (!endDateObject.isValid()) {
      return next(
        new ResponseError("endDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    if (!endDateObject.isAfter(startDateObject)) {
      return next(
        new ResponseError(
          "endDate는 startDate 보다 작거나 같을 수 없습니다.",
          400
        )
      );
    }
    console.log("end date object:", endDateObject);

    // 3. convert to includabletype
    console.log("\n\n-----infos convert to includabletype-----");
    const asList = infos.reduce<any>(
      (acc, cur) => acc.concat(getModelAsByModel(cur)),
      []
    );
    const infosIncludable = infos.reduce<any>(
      (acc, cur) =>
        acc.concat({
          model: cur,
          as: getModelAsByModel(cur),
          attributes: ["value"],
        }),
      []
    );
    console.log(infosIncludable);

    // 4. condition init
    // reportTime
    const whereReportTime = {
      createdAt: {
        [Op.and]: [
          {
            [Op.gte]: startDateObject.toDate(),
          },
          {
            [Op.lte]: endDateObject.toDate(),
          },
        ],
      },
    };

    const humanDatas = await BuildingModel.findOne({
      where: {
        id: buildingId,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "image"],
      },
      include: [
        {
          model: UnitModel,
          as: "units",
          required: true,
          attributes: {
            exclude: ["createdAt", "updatedAt", "buildingId"],
          },
          include: [
            {
              model: SensorModel,
              as: "sensors",
              required: true,
              attributes: {
                exclude: ["createdAt", "updatedAt", "unitId"],
              },
              include: [
                {
                  model: SensorReportTimeModel,
                  as: "timeReports",
                  include: infosIncludable,
                  required: true,
                  where: whereReportTime,
                  attributes: ["createdAt"],
                },
              ],
            },
          ],
        },
      ],
    });

    const plainBuilding = humanDatas?.get({ plain: true });
    const units = (plainBuilding as any).units;
    const newUnits = [];

    for (let unit of units) {
      const newSensors = [];
      const sensors = (unit as any).sensors;

      for (let sensor of sensors) {
        let isDelete: boolean = false;
        const timeReports = sensor.timeReports;
        for (let timeReport of timeReports) {
          // 비어 있는 아우터 조인 결과 제거
          Object.keys(timeReport).forEach((key) => {
            if (timeReport[key] === null) {
              delete timeReport[key];
            }
          });

          let includeCount = 0;
          Object.keys(timeReport).forEach((key) => {
            if (asList.includes(key)) {
              includeCount++;
              timeReport[key] = timeReport[key].value;
            }
          });

          if (includeCount === 0) {
            isDelete = true;
            break;
          }
        }

        if (!isDelete) {
          newSensors.push(sensor);
        }
      }
      if (newSensors.length !== 0) {
        (unit as any).sensors = newSensors;
        newUnits.push(unit);
      }
    }

    if (newUnits.length !== 0) {
      (plainBuilding as any).units = newUnits;
    }

    res.custom = {
      status: 200,
      body: {
        status: true,
        query: Object.keys(query).length === 0 ? "none" : query,
        data: {
          building: plainBuilding,
        },
      },
    };

    return next();
  }
);

ApiRoutes.get(
  "/bems-hdms/:buildingId/:unitId",
  async (req: Request, res: Response, next: NextFunction) => {
    const query = <RequestBEMSApi>req.query;
    const { unitId } = req.params;

    console.log("\n\n-----query-----");
    console.log(query);

    const { include, exclude, startDate, endDate } = query;

    // 1. 모델 파싱 (include, exclude query control)
    // -1. include parsing
    let infos: InformationModel[] = include
      ? getModelsByIncludeColumns(include.split(","))
      : informationModels;
    // -2. exclude parsing ( include query 존재할 경우 동작하지 않는다. )
    if (!include) {
      if (exclude) {
        infos = getModelsByExcludeColumns(exclude.split(","));
      }
    }
    console.log("\n\n-----setting information model okay-----");
    console.log(infos);

    // 2. startDate parsing
    console.log("\n\n-----start date setting-----");
    let startDateObject: moment.Moment | undefined;
    if (startDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )
      startDateObject = moment(startDate);
    } else {
      startDateObject = moment().subtract(7, "day");
    }

    if (!startDateObject.isValid()) {
      return next(
        new ResponseError("startDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    console.log("start date object:", startDateObject);

    // 4. endDate parsing
    console.log("\n\n-----end date setting-----");
    let endDateObject: moment.Moment | undefined;
    if (endDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )

      endDateObject = moment(endDate);
    } else {
      endDateObject = moment(startDateObject).add(7, "d");
    }

    if (!endDateObject.isValid()) {
      return next(
        new ResponseError("endDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    if (!endDateObject.isAfter(startDateObject)) {
      return next(
        new ResponseError(
          "endDate는 startDate 보다 작거나 같을 수 없습니다.",
          400
        )
      );
    }
    console.log("end date object:", endDateObject);

    // 3. convert to includabletype
    console.log("\n\n-----infos convert to includabletype-----");
    const asList = infos.reduce<any>(
      (acc, cur) => acc.concat(getModelAsByModel(cur)),
      []
    );
    const infosIncludable = infos.reduce<any>(
      (acc, cur) =>
        acc.concat({
          model: cur,
          as: getModelAsByModel(cur),
          attributes: ["value"],
        }),
      []
    );
    console.log(infosIncludable);

    // 4. condition init
    // reportTime
    const whereReportTime = {
      createdAt: {
        [Op.and]: [
          {
            [Op.gte]: startDateObject.toDate(),
          },
          {
            [Op.lte]: endDateObject.toDate(),
          },
        ],
      },
    };

    const humanDatas = await UnitModel.findOne({
      where: {
        id: unitId,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "buildingId"],
      },
      include: [
        {
          model: SensorModel,
          as: "sensors",
          required: true,
          attributes: {
            exclude: ["createdAt", "updatedAt", "unitId"],
          },
          include: [
            {
              model: SensorReportTimeModel,
              as: "timeReports",
              include: infosIncludable,
              required: true,
              where: whereReportTime,
              attributes: ["createdAt"],
            },
          ],
        },
      ],
    });

    const plainUnit = humanDatas?.get({ plain: true });
    const sensors = (plainUnit as any).sensors;
    const newSensors = [];

    for (let sensor of sensors) {
      let isDelete: boolean = false;
      const timeReports = sensor.timeReports;
      for (let timeReport of timeReports) {
        // 비어 있는 아우터 조인 결과 제거
        Object.keys(timeReport).forEach((key) => {
          if (timeReport[key] === null) {
            delete timeReport[key];
          }
        });

        let includeCount = 0;
        Object.keys(timeReport).forEach((key) => {
          if (asList.includes(key)) {
            includeCount++;
            timeReport[key] = timeReport[key].value;
          }
        });

        if (includeCount === 0) {
          isDelete = true;
          break;
        }
      }

      if (!isDelete) {
        newSensors.push(sensor);
      }
    }

    if (newSensors.length !== 0) {
      (plainUnit as any).sensors = newSensors;
    }

    res.custom = {
      status: 200,
      body: {
        status: true,
        query: Object.keys(query).length === 0 ? "none" : query,
        data: {
          unit: plainUnit,
        },
      },
    };

    return next();
  }
);

ApiRoutes.get(
  "/bems-hdms/:buildingId/:unitId/:sensorId",
  async (req: Request, res: Response, next: NextFunction) => {
    const query = <RequestBEMSApi>req.query;
    const { sensorId } = req.params;

    console.log("\n\n-----query-----");
    console.log(query);

    const { include, exclude, startDate, endDate } = query;

    // 1. 모델 파싱 (include, exclude query control)
    // -1. include parsing
    let infos: InformationModel[] = include
      ? getModelsByIncludeColumns(include.split(","))
      : informationModels;
    // -2. exclude parsing ( include query 존재할 경우 동작하지 않는다. )
    if (!include) {
      if (exclude) {
        infos = getModelsByExcludeColumns(exclude.split(","));
      }
    }
    console.log("\n\n-----setting information model okay-----");
    console.log(infos);

    // 2. startDate parsing
    console.log("\n\n-----start date setting-----");
    let startDateObject: moment.Moment | undefined;
    if (startDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )
      startDateObject = moment(startDate);
    } else {
      startDateObject = moment().subtract(7, "day");
    }

    if (!startDateObject.isValid()) {
      return next(
        new ResponseError("startDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    console.log("start date object:", startDateObject);

    // 4. endDate parsing
    console.log("\n\n-----end date setting-----");
    let endDateObject: moment.Moment | undefined;
    if (endDate) {
      // YYYY-MM-DDThh:mm:ss
      // 1. 4글자보다 작으면 안됨 ( < 4 error )
      // 2. 시간 설정 시 T다음에 반드시 값이 있어야함 ( === 11 error)
      // 3. 시간 초 (ss) 까지 총 19글자 허용 ( > 19 error )

      endDateObject = moment(endDate);
    } else {
      endDateObject = moment(startDateObject).add(7, "d");
    }

    if (!endDateObject.isValid()) {
      return next(
        new ResponseError("endDate 가 ISO8601 형식에 맞지 않습니다.", 400)
      );
    }
    if (!endDateObject.isAfter(startDateObject)) {
      return next(
        new ResponseError(
          "endDate는 startDate 보다 작거나 같을 수 없습니다.",
          400
        )
      );
    }
    console.log("end date object:", endDateObject);

    // 3. convert to includabletype
    console.log("\n\n-----infos convert to includabletype-----");
    const asList = infos.reduce<any>(
      (acc, cur) => acc.concat(getModelAsByModel(cur)),
      []
    );
    const infosIncludable = infos.reduce<any>(
      (acc, cur) =>
        acc.concat({
          model: cur,
          as: getModelAsByModel(cur),
          attributes: ["value"],
        }),
      []
    );
    console.log(infosIncludable);

    // 4. condition init
    // reportTime
    const whereReportTime = {
      createdAt: {
        [Op.and]: [
          {
            [Op.gte]: startDateObject.toDate(),
          },
          {
            [Op.lte]: endDateObject.toDate(),
          },
        ],
      },
    };

    const humanDatas = await SensorModel.findOne({
      where: {
        id: sensorId,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "unitId"],
      },
      include: [
        {
          model: SensorReportTimeModel,
          as: "timeReports",
          include: infosIncludable,
          required: true,
          where: whereReportTime,
          attributes: ["createdAt"],
        },
      ],
    });

    const plainSensor = humanDatas?.get({ plain: true });

    let isDelete: boolean = false;

    if (plainSensor) {
      const timeReports = (plainSensor as any).timeReports;
      if (timeReports) {
        for (let timeReport of timeReports) {
          // 비어 있는 아우터 조인 결과 제거
          Object.keys(timeReport).forEach((key) => {
            if (timeReport[key] === null) {
              delete timeReport[key];
            }
          });

          let includeCount = 0;
          Object.keys(timeReport).forEach((key) => {
            if (asList.includes(key)) {
              includeCount++;
              timeReport[key] = timeReport[key].value;
            }
          });

          if (includeCount === 0) {
            isDelete = true;
            break;
          }
        }
      }
    }

    res.custom = {
      status: 200,
      body: {
        status: true,
        query: Object.keys(query).length === 0 ? "none" : query,
        data: {
          sensor: plainSensor || null,
        },
      },
    };

    return next();
  }
);

export default ApiRoutes;

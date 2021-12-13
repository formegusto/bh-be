import { Request, Response, Router } from "express";
import { Includeable } from "sequelize/dist";
import BuildingModel from "../../models/building";
import InformationModel from "../../models/information";
import {
  informationModels,
  IsStayModel,
  ResidentCountModel,
} from "../../models/information/models";
import SensorModel from "../../models/sensor";
import SensorReportTimeModel from "../../models/sensorReportTime";
import { requestBodyEncrypt } from "../../utils/ARIAUtils";
import {
  getModelAsByModel,
  getModelsByExcludeColumns,
  getModelsByIncludeColumns,
} from "../../utils/DataProcessUtils";
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
ApiRoutes.get("/humanData", async (req: Request, res: Response) => {
  const query = <RequestBEMSApi>req.query;
  console.log("-----query-----");
  console.log(query);

  const { include, exclude } = query;
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
  console.log("-----setting information model okay-----");
  console.log(infos);

  // 2. convert to includabletype
  console.log("-----infos convert to includabletype-----");
  const infosIncludable = infos.reduce<any>(
    (acc, cur) =>
      acc.concat({
        model: cur,
        as: getModelAsByModel(cur),
      }),
    []
  );
  console.log(infosIncludable);

  try {
    const humanDatas = await BuildingModel.findAll({
      // raw: true,
      // nest: true,
      include: [
        {
          model: SensorModel,
          include: [
            {
              model: SensorReportTimeModel,
              as: "timeReports",
              include: infosIncludable,
            },
          ],
        },
      ],
    });

    const plainHumanDatas = [];
    for (let hd of humanDatas) {
      const sensors = (hd as any).dataValues.Sensors;
      for (let sensor of sensors) {
        const timeReports = sensor.dataValues.timeReports;
        for (let timeReport of timeReports) {
          const report = timeReport.dataValues;
          Object.keys(report).forEach((key) => {
            if (!report[key].length) {
              delete report[key];
            }
          });
        }
      }
      plainHumanDatas.push(hd.get({ plain: true }));
    }
    console.log(plainHumanDatas);
    requestBodyEncrypt(plainHumanDatas, req.decryptKey!);

    return res.status(200).json({
      status: true,
      query: Object.keys(query).length === 0 ? "none" : query,
      requestQuery: plainHumanDatas,
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      status: false,
      query: query,
      error: {
        message: err.message,
      },
    });
  }
});

export default ApiRoutes;

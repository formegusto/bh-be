export type RequestBuilding = {
  [key: string]: any;
  name: string;
  ho: string;
};

export type RequestSensor = {
  [key: string]: any;
  name: string;
};

export type RequestInformation = {
  [key: string]: any;
};

export type HumanDataBody = {
  [key: string]: RequestBuilding | RequestSensor | RequestInformation;
  building: RequestBuilding;
  sensor: RequestSensor;
  information: RequestInformation;
};

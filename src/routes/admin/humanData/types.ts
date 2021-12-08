export type RequestBuilding = {
  name: string;
};

export type RequestSensor = {
  name: string;
};

export type RequestInformation = {
  [key: string]: any;
};

export type HumanDataBody = {
  building: RequestBuilding;
  sensor: RequestSensor;
  information: RequestInformation;
};

export type RequestInformation = {
  [key: string]: any;
};

export type HumanDataBody = {
  [key: string]: string | RequestInformation;
  building: string;
  unit: string;
  sensor: string;
  information: RequestInformation;
};

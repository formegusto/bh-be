import {
  ApiApplicationAttributes,
  ApiApplicationStatus,
} from "../../../models/apiApplication/types";

export type ApiApplicationQuery = {
  offset?: number;
};

export type GetApplicationsResponse = {
  currentPage: number;
  lastPage: number;
  count: number;
  applications: ApiApplicationAttributes[];
};

export type PatchApplicationRequest = {
  status: ApiApplicationStatus;
};

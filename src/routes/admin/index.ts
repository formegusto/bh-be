import { NextFunction, Request, Response, Router } from "express";
import ApiApplicationRoutes from "./apiApplication";
import HumanDataRoutes from "./humanData";

const AdminRoutes = Router();

AdminRoutes.use("/humanData", HumanDataRoutes);
AdminRoutes.use("/apiService", ApiApplicationRoutes);

export default AdminRoutes;

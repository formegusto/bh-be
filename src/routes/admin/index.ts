import { Router } from "express";
import adminCheck from "../middlewares/adminCheck";
import ApiApplicationRoutes from "./apiApplication";
import HumanDataRoutes from "./humanData";

const AdminRoutes = Router();

AdminRoutes.use("/humanData", HumanDataRoutes);
AdminRoutes.use("/apiService", ApiApplicationRoutes);

export default AdminRoutes;

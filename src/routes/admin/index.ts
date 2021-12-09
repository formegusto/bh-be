import { Router } from "express";
import adminCheck from "../middlewares/adminCheck";
import HumanDataRoutes from "./humanData";

const AdminRoutes = Router();

AdminRoutes.use("/humanData", adminCheck, HumanDataRoutes);

export default AdminRoutes;

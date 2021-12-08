import { Router } from "express";
import HumanDataRoutes from "./humanData";

const AdminRoutes = Router();

AdminRoutes.use("/humanData", HumanDataRoutes);

export default AdminRoutes;

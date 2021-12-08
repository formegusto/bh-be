import { Router } from "express";
import AdminRoutes from "./admin";

const Routes = Router();

Routes.use("/admin", AdminRoutes);

export default Routes;

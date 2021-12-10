import { Router } from "express";
import AdminRoutes from "./admin";
import UserRoutes from "./user";

const Routes = Router();

Routes.use("/admin", AdminRoutes);
Routes.use("/user", UserRoutes);

export default Routes;

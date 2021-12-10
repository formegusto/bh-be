import { Router } from "express";
import AdminRoutes from "./admin";
import ApiApplicationRoutes from "./apiApplication";
import adminCheck from "./middlewares/adminCheck";
import { loginCheck } from "./middlewares/loginCheck";
import UserRoutes from "./user";

const Routes = Router();

Routes.use("/admin", adminCheck, AdminRoutes);
Routes.use("/user", UserRoutes);
Routes.use("/apiService", loginCheck, ApiApplicationRoutes);

export default Routes;

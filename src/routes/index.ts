import { Router } from "express";
import AdminRoutes from "./admin";
import ApiRoutes from "./api";
import ApiApplicationRoutes from "./apiApplication";
import adminCheck from "./middlewares/adminCheck";
import { loginCheck } from "./middlewares/loginCheck";
import validApiUse from "./middlewares/validApiUse";
import UserRoutes from "./user";

const Routes = Router();

Routes.use("/admin", adminCheck, AdminRoutes);
Routes.use("/user", UserRoutes);
Routes.use("/apiService", loginCheck, ApiApplicationRoutes);
// Routes.use("/api", validApiUse, ApiRoutes);
Routes.use("/api", ApiRoutes);

export default Routes;

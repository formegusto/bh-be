import { Router } from "express";
import swaggerRoutes from "../swagger";
import AdminRoutes from "./admin";
import ApiApplicationRoutes from "./apiApplication";
import InfoRoutes from "./information";
import adminCheck from "./middlewares/adminCheck";
import { loginCheck } from "./middlewares/loginCheck";
import UserRoutes from "./user";

const Routes = Router();

// Routes.use("/admin", adminCheck, AdminRoutes);
Routes.use("/api-docs", swaggerRoutes);
Routes.use("/admin", loginCheck, AdminRoutes);
Routes.use("/user", UserRoutes);
Routes.use("/apiService", loginCheck, ApiApplicationRoutes);
Routes.use("/info", InfoRoutes);

export default Routes;

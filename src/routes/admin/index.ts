import { Router } from "express";
import UserRoutes from "./user";
import ApiApplicationRoutes from "./apiApplication";
import BEMSHDMSRoutes from "./bems-hdms";
import DataRoutes from "./data";

const AdminRoutes = Router();

AdminRoutes.use("/user", UserRoutes);
AdminRoutes.use("/bems-hdms", BEMSHDMSRoutes);
AdminRoutes.use("/apiService", ApiApplicationRoutes);
AdminRoutes.use("/data", DataRoutes);

export default AdminRoutes;

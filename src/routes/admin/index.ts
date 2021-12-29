import { Router } from "express";
import UserRoutes from "./user";
import ApiApplicationRoutes from "./apiApplication";
import BEMSHDMSRoutes from "./bems-hdms";

const AdminRoutes = Router();

AdminRoutes.use("/user", UserRoutes);
AdminRoutes.use("/bems-hdms", BEMSHDMSRoutes);
AdminRoutes.use("/apiService", ApiApplicationRoutes);

export default AdminRoutes;

import { Router } from "express";
import ApiApplicationRoutes from "./apiApplication";
import BEMSHDMSRoutes from "./bems-hdms";

const AdminRoutes = Router();

AdminRoutes.use("/bems-hdms", BEMSHDMSRoutes);
AdminRoutes.use("/apiService", ApiApplicationRoutes);

export default AdminRoutes;

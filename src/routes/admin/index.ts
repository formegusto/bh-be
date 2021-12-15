import { NextFunction, Request, Response, Router } from "express";
import ApiApplicationRoutes from "./apiApplication";
import HumanDataRoutes from "./humanData";

const AdminRoutes = Router();

AdminRoutes.use("/humanData", HumanDataRoutes);
AdminRoutes.use("/apiService", ApiApplicationRoutes);
AdminRoutes.get("/key", (req: Request, res: Response, next: NextFunction) => {
  try {
    const communityKey = process.env.COMMUNITY_KEY!;

    res.custom = {
      status: 200,
      body: {
        status: true,
        key: communityKey,
      },
    };

    return next();
  } catch (err: any) {
    return res.status(500).json({
      status: false,
      error: {
        message: err.message,
      },
    });
  }
});

export default AdminRoutes;

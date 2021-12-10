import { Request, Response, Router } from "express";

const ApiApplicationRoutes = Router();

ApiApplicationRoutes.post("/apply", (req: Request, res: Response) => {
  console.log(req.loginUser);

  return res.status(201).json({
    status: true,
  });
});

export default ApiApplicationRoutes;

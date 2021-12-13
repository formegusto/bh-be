import dotenv from "dotenv";
import express, { Request, Response } from "express";
import sequelize from "./models";
import Routes from "./routes";
import cors from "cors";
import ApiApplicationModel from "./models/apiApplication";
import UserModel from "./models/user";

dotenv.config();

sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("[sequelize] synchronizing success :)");
    await ApiApplicationModel.destroy({ where: {} });
    await UserModel.destroy({ where: {} });
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 80;
const app: express.Application = express();

app.use(cors());
app.use(express.json());

app.use(Routes);
app.get("/aria-test", (req: Request, res: Response) => {
  const adminKey = process.env.INDBARIAKEY!;

  return res.status(200).json({
    status: true,
  });
});

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

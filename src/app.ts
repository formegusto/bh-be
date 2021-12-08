import dotenv from "dotenv";
import express, { Request, Response } from "express";
import sequelize from "./models";
import Routes from "./routes";
import ARIAEngine from "./utils/ARIAEngine";
import { stringToByte } from "./utils/ARIAUtils";

dotenv.config();

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("[sequelize] synchronizing success :)");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT || 80;
const app: express.Application = express();

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

import dotenv from "dotenv";
import express, { Request, Response } from "express";
import sequelize from "./models";
import Routes from "./routes";
import cors from "cors";
import ApiApplicationModel from "./models/apiApplication";
import UserModel from "./models/user";
import decryptBody from "./routes/middlewares/decryptBody";
import encryptBody from "./routes/middlewares/encryptBody";

dotenv.config();

sequelize
  .sync({ force: true })
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

app.use(decryptBody, Routes, encryptBody);

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

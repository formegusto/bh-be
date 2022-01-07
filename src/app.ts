import dotenv from "dotenv";
import express from "express";
import sequelize from "./models";
import Routes from "./routes";
import cors from "cors";
import ApiApplicationModel from "./models/apiApplication";
import UserModel from "./models/user";
import decryptBody from "./routes/middlewares/decryptBody";
import encryptBody from "./routes/middlewares/encryptBody";
import { _generateKeyPair } from "./utils/_generateKeyPair";
import SessionCertRoutes from "./routes/sessionCert";
import ApiRoutes from "./routes/api";
import validApiUse from "./routes/middlewares/validApiUse";
import ResponseErrorHandler from "./routes/error";
import morgan from "morgan";

dotenv.config();

sequelize
  .sync({
    // force: true,
    // alter: true,
  })
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
app.use(morgan("dev"));
app.use(express.text());
app.use(express.json());
app.use("/static", express.static("public"));

app.use("/sessionCert", SessionCertRoutes);
app.use("/api", validApiUse, ApiRoutes, encryptBody);
app.use(decryptBody, Routes, encryptBody);
app.use(ResponseErrorHandler);

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

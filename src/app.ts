import dotenv from "dotenv";
import express from "express";
import sequelize from "./models";

dotenv.config();

sequelize
  .sync({ force: true })
  .then(() => {
    console.log("[sequelize] synchronizing success :)");
  })
  .catch((err) => {
    console.log(err);
  });

const PORT = process.env.PORT && 80;
const app: express.Application = express();

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

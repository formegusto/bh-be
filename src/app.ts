import dotenv from "dotenv";
import express from "express";

dotenv.config();

const PORT = process.env.PORT && 80;
const app: express.Application = express();

app.listen(PORT, () => {
  console.log("[express] listen", PORT);
});

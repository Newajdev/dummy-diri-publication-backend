import express from "express";
import dotenv from "dotenv";
import { env } from "./config/env";

dotenv.config();

const app = express();

const port = env.PORT;
app.use(express.json());

app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});

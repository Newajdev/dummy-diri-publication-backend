import express from "express";
import dotenv from "dotenv";
import { env } from "./config/env";

dotenv.config();

const app = express();

const port = env.PORT;
app.use(express.json());

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});

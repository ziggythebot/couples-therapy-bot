import express from "express";
import { config } from "./config.js";
import { intakeRouter } from "./routes/intake.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/intake", intakeRouter);

app.listen(config.port, () => {
  console.log(`session-api listening on port ${config.port}`);
});

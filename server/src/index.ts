import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Base health check for service verification
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "moukawilos-server",
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, () => {
  console.log(`[server]: MoukawilOS Server skeleton listening on port ${port}`);
});

export default app;

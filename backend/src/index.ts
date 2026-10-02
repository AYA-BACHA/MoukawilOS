import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Infrastructure health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "moukawilos-backend",
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`[backend] MoukawilOS Backend running on port ${port}`);
  });
}

export default app;

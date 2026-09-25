import express, { Application } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";
import { healthRouter } from "./routes/health.routes";
import { categoryRouter } from "./routes/category.routes";
import { productRouter } from "./routes/product.routes";
import { exchangeRateRouter } from "./routes/exchange-rate.routes";
import { orderRouter } from "./routes/order.routes";
import { statsRouter } from "./routes/stats.routes";
import { authRouter } from "./routes/auth.routes";
import { userRouter } from "./routes/user.routes";

export function createApp(): Application {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  app.use(healthRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/products", productRouter);
  app.use("/api/exchange-rates", exchangeRateRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/stats", statsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);

  // El error handler siempre va al final, después de todas las rutas.
  app.use(errorHandler);

  return app;
}

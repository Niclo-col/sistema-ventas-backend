import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { prisma } from "./database/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Servidor escuchando en el puerto ${env.PORT} (${env.NODE_ENV})`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} recibido, cerrando servidor con gracia...`);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info("Servidor cerrado.");
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

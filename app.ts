import { Application } from "./deps.ts";
import config from "./config.ts";

// app middleware
import notFound from "./middlewares/notFound.ts";
import logger from "./middlewares/logger.ts";
import cors from "./middlewares/cors.ts";

// app routes
import serverIndex from "./routes/index.server.ts";
import clientIndex from "./routes/index.client.ts";

const app = new Application();

app.use(logger.logger);
app.use(logger.responseTime);
app.use(cors);

// API Server Routes
app.use(serverIndex.routes());
app.use(serverIndex.allowedMethods());

// Client Routes
if (config.CLIENTMODE === "on") {
  app.use(clientIndex.routes());
  app.use(clientIndex.allowedMethods());
}

// General 404 Error Page
app.use(notFound);

export default app;

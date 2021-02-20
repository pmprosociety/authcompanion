import { Application } from "./deps.ts";
// middleware
import notFound from "./middlewares/notFound.ts";
// logging
import logger from "./middlewares/logger.ts";
// routes
import index from "./routes/index.ts";

const app = new Application();

// app.use(organ());
app.use(logger.logger);
app.use(logger.responseTime);

app.use(index.routes());
app.use(index.allowedMethods());

// General 404 Error Page
app.use(notFound);

//Setup DB
// try {
//   await db.connect();
// } catch (e) {
//   log.error("DB Connection failed - shutting down");
//   log.error(e);
//   Deno.exit(1);
// }

export default app;

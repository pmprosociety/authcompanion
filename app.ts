import { Application } from "./deps.ts";
// middleware
import notFound from "./middlewares/notFound.ts";
// logging
import logger from "./middlewares/logger.ts";
// routes
import index from "./routes/index.ts";
import {ORIGIN} from "./config.ts";

const app = new Application();

app.use(logger.logger);
app.use(logger.responseTime);

//Enable CORS
app.use((ctx, next) => {
    ctx.response.headers.set('Access-Control-Allow-Origin', ORIGIN ?? '*')
    ctx.response.headers.set('Access-Control-Allow-Credentials', 'true')
    ctx.response.headers.set('Access-Control-Allow-Headers', 'Content-type,Authorization,Cookie')

    return next()
  })

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

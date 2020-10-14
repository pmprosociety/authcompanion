import { Application } from "./deps.ts";
// middleware
import notFound from "./middlewares/notFound.ts";
// logging
import { organ } from "./deps.ts";
//routes
import index from "./routes/index.ts";

const app = new Application();

app.use(organ());

app.use(index.routes());
app.use(index.allowedMethods());

// General 404 Error Page
app.use(notFound);

export default app;

import app from "../app.ts";
import { config } from "../deps.ts";

const env = config();

const PORT = +env.PORT || 3000;

app.addEventListener("listen", ({ secure, hostname, port }) => {
  const protocol = secure ? "https://" : "http://";
  const url = `${protocol}${hostname ?? "localhost"}:${port}`;
  console.log(`🚀 Ready on ${url}`);
});
await app.listen({ port: PORT });

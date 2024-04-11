import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./routes/auth";
import { blog } from "./routes/blog";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { user } from "./routes/user";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    MY_JWT_SECRET: string;
  };
  Variables: {
    userid: string;
  };
}>().basePath("/api/v1");

app.use(cors());
app.use(poweredBy());
app.use(logger());

app.route("/auth", auth);
app.route("/blog", blog);
app.route("/users", user);

export default app;

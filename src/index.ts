import { Hono } from "hono";
import { auth } from "./routes/auth";
import { blog } from "./routes/blog";
import { logger } from "hono/logger";
import { poweredBy } from "hono/powered-by";
import { verify } from "hono/jwt";
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

app.use(poweredBy());
app.use(logger());

/**
 *  extract token from heading
 *  verify token
 *  if token is valid than next()
 *  else give error if token is in valid
 */

app.use("/blog/*", async (c, next) => {
  const authorization = c.req.header("authorization") || "";
  const token = authorization.split(" ")[1];

  if (!token) {
    c.status(403);
    return c.json({ message: "Unauthorized" });
  }

  try {
    const payload = await verify(token, c.env.MY_JWT_SECRET);

    if (payload.id) {
      c.set("userid", payload.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "Unauthorized" });
    }
  } catch (error) {
    c.status(500);
    return c.json(error);
  }
});

app.use("/users/*", async (c, next) => {
  const authorization = c.req.header("authorization") || "";
  const token = authorization.split(" ")[1];

  if (!token) {
    c.status(403);
    return c.json({ message: "Unauthorized" });
  }

  try {
    const payload = await verify(token, c.env.MY_JWT_SECRET);

    if (payload.id) {
      c.set("userid", payload.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "Unauthorized" });
    }
  } catch (error) {
    c.status(500);
    return c.json(error);
  }
});

app.route("/auth", auth);
app.route("/blog", blog);
app.route("/users", user);

export default app;

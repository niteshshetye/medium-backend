import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

const user = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    MY_JWT_SECRET: string;
  };
  Variables: {
    userid: string;
  };
}>();

/**
 *  extract token from heading
 *  verify token
 *  if token is valid than next()
 *  else give error if token is in valid
 */

user.use("/*", async (c, next) => {
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

user.get("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const users = await prisma.user.findMany({
      relationLoadStrategy: "join",
      select: {
        id: true,
        name: true,
        email: true,
        posts: true,
      },
    });

    c.status(200);
    return c.json(users);
  } catch (error) {
    c.status(404);
    return c.json(error);
  }
});

export { user };

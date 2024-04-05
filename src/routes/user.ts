import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

const user = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    MY_JWT_SECRET: string;
  };
  Variables: {
    userid: string;
  };
}>();

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

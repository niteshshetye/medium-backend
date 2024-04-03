import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const auth = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>();

type CreateBody = {
  email: string;
  password: string;
  name: string;
};

auth
  .post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json<CreateBody>();

    const response = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
      },
    });

    return c.json(response);
  })
  .post("/signin", (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    return c.text("Signin");
  });

export { auth };

import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";

type CreatPost = {
  title: string;
  content: string;
  authorId: string;
};

const blog = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    MY_JWT_SECRET: string;
  };
  Variables: {
    userid: string;
  };
}>();

blog
  .post("/", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const body = await c.req.json<CreatPost>();

      const posts = await prisma.post.create({
        data: { ...body, authorId: c.get("userid") },
      });

      c.status(201);
      return c.json(posts);
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  })
  .put("/:id", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { id } = c.req.param();

    try {
      const body = await c.req.json();

      console.log(body);

      if (!body) {
        c.status(404);
        return c.json({ message: "Invalid input" });
      }

      const post = await prisma.post.update({
        where: {
          id,
        },
        data: body,
      });
      if (!post) {
        c.status(404);
        return c.json({ message: "Post not found!" });
      }

      c.status(200);
      return c.json(post);
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  })
  .get("/:id", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { id } = c.req.param();

    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
      });

      c.status(201);
      return c.json(post);
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  })
  .get("/", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const blogs = await prisma.post.findMany({
        orderBy: {
          modifiedAt: "desc",
        },
      });
      c.status(200);
      return c.json(blogs);
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  });

export { blog };

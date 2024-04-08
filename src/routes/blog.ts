import { Hono } from "hono";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";
import { verify } from "hono/jwt";
import {
  createPostBody,
  CreatePostBody,
  updatePostBody,
  UpdatePostBody,
} from "@niteshshetye/medium-common";

const blog = new Hono<{
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

blog.use("/*", async (c, next) => {
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

blog
  .get("/search", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { title } = c.req.query();

    try {
      const blogs = await prisma.post.findMany({
        where: {
          title: {
            contains: `%${title}%`,
            mode: "insensitive",
          },
        },
      });
      c.status(200);
      return c.json(blogs);
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
  .put("/:id", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const { id } = c.req.param();

    try {
      const body = await c.req.json<UpdatePostBody>();

      const { success } = updatePostBody.safeParse(body);

      if (!success) {
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
  .get("/", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const blogs = await prisma.post.findMany({
        relationLoadStrategy: "join",
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
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
  })
  .post("/", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const body = await c.req.json<CreatePostBody>();

      const { success } = createPostBody.safeParse(body);

      if (!success) {
        c.status(404);
        return c.json({ message: "Invalid input" });
      }

      const posts = await prisma.post.create({
        data: { ...body, authorId: c.get("userid") },
      });

      c.status(201);
      return c.json(posts);
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  });

export { blog };

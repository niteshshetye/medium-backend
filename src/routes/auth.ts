import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";

const auth = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    MY_JWT_SECRET: string;
  };
}>();

type CreateBody = {
  email: string;
  password: string;
  name: string;
};

type SignInBody = {
  email: string;
  password: string;
};

/**
 * *SIGNUP*
 * check is input valid
 * check is user already exist
 * if yes then throw error user already exist
 * no then create user
 * create jwt
 * return jwt and basic info of account to user in response
 *
 *
 * *SIGNIN*
 * check is input valid
 * check is user exist
 * if yes then create jwt
 * return jwt and basic info of account to user in response
 * no then throw error User not exist
 */
auth
  .post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const body = await c.req.json<CreateBody>();

      // * check is input valid
      if (!body.email || !body.password || !body.name) {
        c.status(404);
        return c.json({
          message: "Email or password or name can't be empty",
        });
      }

      // * check is user already exist
      const userDetails = await prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });

      // * if yes then throw error user already exist
      if (userDetails) {
        c.status(404);
        return c.json({
          message: "User already exist!",
        });
      }

      // * no then create user
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

      // * create jwt
      const token = await sign(response, c.env.MY_JWT_SECRET);

      // * return jwt and basic info of account to user in response
      c.status(201);
      return c.json({ access_token: token, ...response });
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  })
  .post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const body = await c.req.json<SignInBody>();

      // * check is input valid
      if (!body.email || !body.password) {
        c.status(404);
        return c.json({
          message: "Email or Password can't be empty",
        });
      }

      // * check is user exist
      const userDetails = await prisma.user.findUnique({
        where: {
          email: body.email,
          password: body.password,
        },
        select: {
          id: true,
          email: true,
          name: true,
          password: false,
        },
      });

      // * no then throw error User not exist
      if (!userDetails) {
        c.status(404);
        return c.json({
          message: "User not found!",
        });
      }

      // * if yes then create jwt
      const token = await sign(userDetails, c.env.MY_JWT_SECRET);

      // * return jwt and basic info of account to user in response
      c.status(200);
      return c.json({ access_token: token, ...userDetails });
    } catch (error) {
      c.status(404);
      return c.json(error);
    }
  });

export { auth };

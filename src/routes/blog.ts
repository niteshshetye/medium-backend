import { Hono } from "hono";

const blog = new Hono();

blog
  .post("/", (c) => {
    return c.text("add blog");
  })
  .put("/:id", (c) => {
    return c.text("update blog");
  })
  .get("/:id", (c) => {
    return c.text("get blog");
  })
  .get("/", (c) => {
    return c.text("get all blog");
  });

export { blog };

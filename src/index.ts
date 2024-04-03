import { Hono } from "hono";
import { auth } from "./routes/auth";
import { blog } from "./routes/blog";

const app = new Hono().basePath("/api/v1");

app.route("/auth", auth);
app.route("/blog", blog);

export default app;

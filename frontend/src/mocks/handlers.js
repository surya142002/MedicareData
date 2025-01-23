import { rest } from "msw";

export const handlers = [
  rest.get("/api/datasets", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: "1", name: "ICD-10-CM" },
        { id: "2", name: "HCPCS" },
      ])
    );
  }),
  rest.post("/api/auth/login", (req, res, ctx) => {
    const { email, password } = req.body;
    if (email === "admin@test.com" && password === "password123") {
      return res(
        ctx.status(200),
        ctx.json({ token: "mock-token", user: { id: "1", role: "admin" } })
      );
    }
    return res(ctx.status(401), ctx.json({ message: "Invalid credentials" }));
  }),
];

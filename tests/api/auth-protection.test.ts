import request from "supertest";
import { createApp } from "../../src/app";

describe("Protección de rutas (sin token)", () => {
  const app = createApp();

  it.each([
    ["GET", "/api/categories"],
    ["GET", "/api/products"],
    ["GET", "/api/exchange-rates/current"],
    ["GET", "/api/orders"],
    ["GET", "/api/stats/summary"],
    ["GET", "/api/users"],
  ])("%s %s responde 401 sin Authorization header", async (method, path) => {
    const res = await (request(app) as any)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
  });

  it("POST /api/auth/login con credenciales inválidas responde 401, no 500", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "no-existe@test.dev", password: "wrong" });

    expect(res.status).toBe(401);
  });
});

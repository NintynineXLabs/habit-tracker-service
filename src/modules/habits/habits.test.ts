import { describe, it, expect } from "bun:test";
import app from "./habits.routes";

describe("Habits Module", () => {
  it("should return 200 on GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });
});

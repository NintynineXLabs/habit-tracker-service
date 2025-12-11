import { describe, it, expect } from "bun:test";
import app from "./sessions.routes";

describe("Sessions Module", () => {
  it("should return 200 on GET /weekly", async () => {
    const res = await app.request("/weekly");
    expect(res.status).toBe(200);
  });
});

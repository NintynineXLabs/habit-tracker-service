import { describe, it, expect } from "bun:test";
import app from "./daily-logs.routes";

describe("Daily Logs Module", () => {
  it("should return 200 on GET /", async () => {
    const res = await app.request("/");
    expect(res.status).toBe(200);
  });
});

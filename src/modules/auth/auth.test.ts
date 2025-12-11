import { describe, it, expect, mock } from "bun:test";
import app from "./auth.routes";

// Mock Google Auth Library
mock.module("google-auth-library", () => {
  return {
    OAuth2Client: class {
      async verifyIdToken() {
        return {
          getPayload: () => ({
            sub: "test-google-id",
            email: "test@example.com",
            name: "Test User",
            picture: "http://example.com/pic.jpg",
          }),
        };
      }
    },
  };
});

describe("Auth Module", () => {
  it("should return token on POST /google", async () => {
    const res = await app.request("/google", {
      method: "POST",
      body: JSON.stringify({ token: "fake-token" }),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("token");
    expect(body).toHaveProperty("user");
  });

  it("should return 400 if token is missing", async () => {
    const res = await app.request("/google", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status).toBe(400);
  });
});

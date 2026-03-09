import type { Express } from "express";
import request from "supertest";
import { beforeAll, expect, test } from "vitest";
import { getTestApp } from "../vitest-db-setup";

let app: Express;

beforeAll(async () => {
  app = await getTestApp();
});

test("GET /health-check returns 200", async () => {
  const res = await request(app).get("/health-check");
  expect(res.status).toBe(200);
});

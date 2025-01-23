import { test, expect } from "@jest/globals";

test("TextEncoder is defined", () => {
  expect(typeof TextEncoder).toBe("function");
});

test("TextDecoder is defined", () => {
  expect(typeof TextDecoder).toBe("function");
});

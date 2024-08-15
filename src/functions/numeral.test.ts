import { describe, it, expect } from "vitest";

import { formatNumber } from "./numeral";

describe("Numeral", () => {
  it("should format string numeric value", () => {
    expect(formatNumber("123456789")).toEqual("123,456,789");
    expect(formatNumber("123456789.00", "0,0")).toEqual("123,456,789");
  });
  it("should format number", () => {
    expect(formatNumber(123456789)).toEqual("123,456,789");
    expect(formatNumber(123456789, "0,0")).toEqual("123,456,789");
  });
});

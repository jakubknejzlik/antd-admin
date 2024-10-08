import dayjs from "dayjs";
import {
  DateRangeType,
  fillDateRange,
  getDateWindows,
  getListOfDatesBetween,
  getTextForDateRange,
} from "./date-range";
import { describe, expect, it } from "vitest";

describe("fillDateRange", () => {
  it("should fill the date range correctly", () => {
    const data = [{ date: "2023-01-01" }, { date: "2023-01-03" }];
    const result = fillDateRange(data, {
      dateAttribute: "date",
      dateRangeType: DateRangeType.DAY,
      startDate: dayjs("2023-01-01"),
      endDate: dayjs("2023-01-03"),
    });
    expect(result).toEqual([
      { date: dayjs("2023-01-01").toISOString() },
      { date: dayjs("2023-01-02").toISOString() },
      { date: dayjs("2023-01-03").toISOString() },
    ]);
  });
});

describe("getListOfDatesBetween", () => {
  it("should return a list of dates between two dates", () => {
    const result = getListOfDatesBetween(
      dayjs("2023-01-01"),
      dayjs("2023-01-03"),
      "day"
    );
    expect(result).toEqual([
      dayjs("2023-01-01"),
      dayjs("2023-01-02"),
      dayjs("2023-01-03"),
    ]);
  });
});

describe("getDateWindows", () => {
  it("should return a list of date windows", () => {
    const result = getDateWindows(
      dayjs("2023-01-01"),
      dayjs("2023-01-03"),
      2,
      1,
      "day"
    );
    expect(result).toEqual([
      { from: dayjs("2023-01-01"), to: dayjs("2023-01-03") },
      { from: dayjs("2023-01-02"), to: dayjs("2023-01-04") },
    ]);
  });
});

describe("getTextForDateRange", () => {
  it("should return a single date in MM/YY format when both dates are the same and unit is month", () => {
    const result = getTextForDateRange(
      dayjs("2023-01-01"),
      dayjs("2023-01-01")
    );
    expect(result).toBe("01/23");
  });

  it("should return a date range in MM/YY format when dates are different and unit is month", () => {
    const result = getTextForDateRange(
      dayjs("2023-01-01"),
      dayjs("2023-02-01")
    );
    expect(result).toBe("01/23 - 02/23");
  });

  it("should return a single date in YY format when both dates are the same and unit is year", () => {
    const result = getTextForDateRange(
      dayjs("2023-01-01"),
      dayjs("2023-12-31"),
      "year"
    );
    expect(result).toBe("23");
  });

  it("should return a date range in YY format when dates are different and unit is year", () => {
    const result = getTextForDateRange(
      dayjs("2022-12-31"),
      dayjs("2023-01-01"),
      "year"
    );
    expect(result).toBe("22 - 23");
  });

  it("should return a single date in DD/MM/YY format when both dates are the same and unit is day", () => {
    const result = getTextForDateRange(
      dayjs("2023-01-01"),
      dayjs("2023-01-01"),
      "day"
    );
    expect(result).toBe("1/1/23");
  });

  it("should return a date range in DD/MM/YY format when dates are different and unit is day", () => {
    const result = getTextForDateRange(
      dayjs("2023-01-01"),
      dayjs("2023-01-02"),
      "day"
    );
    expect(result).toBe("1/1/23 - 2/1/23");
  });
});

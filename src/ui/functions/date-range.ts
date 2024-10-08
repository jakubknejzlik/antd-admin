import dayjs, { Dayjs, ManipulateType, QUnitType } from "dayjs";
// var quarterOfYear = require('dayjs/plugin/quarterOfYear');
import quarterOfYear from "dayjs/plugin/quarterOfYear";
dayjs.extend(quarterOfYear);

// Type definition for an array of data with a generic type T.
type DateRangeData<T> = Array<T>;

// Enum to represent different types of date ranges.
export enum DateRangeType {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

// Interface for the properties required to fill a date range.
export interface FillDateRangeProps<T = any> {
  dateAttribute: keyof T; // The attribute/key in the data that represents the date.
  dateRangeType: DateRangeType; // The type of date range (e.g., DAY, WEEK, etc.).
  startDate: Dayjs; // The start date of the range.
  endDate: Dayjs; // The end date of the range.
  compareValues?: (value1: Dayjs, value2: Dayjs) => boolean;
  emptyValue?: T;
}

/**
 * Function to fill in missing dates in a given data range.
 *
 * @param data - The original data array.
 * @param props - The properties required to fill the date range.
 * @returns - A new array with the missing dates filled in.
 */
export const fillDateRange = <T = { [key: string]: any }>(
  data: DateRangeData<T>,
  props: FillDateRangeProps<T>
): DateRangeData<T> => {
  const { dateAttribute, dateRangeType, startDate, endDate, emptyValue } =
    props;
  let currentDate = startDate.startOf(dateRangeType);
  const filledData: DateRangeData<T> = [];
  const compareValues =
    props.compareValues || ((value1, value2) => value1.isSame(value2));

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate)) {
    const existingItem = data.find((item) =>
      compareValues(
        dayjs(item[dateAttribute] as unknown as string) // TODO: remove unknown
          .startOf(dateRangeType),
        currentDate
      )
    );

    if (existingItem) {
      filledData.push({
        ...existingItem,
        [dateAttribute]: currentDate.toISOString(),
      });
    } else {
      const newItem: T = {
        ...emptyValue,
        [dateAttribute]: currentDate.toISOString(),
      } as unknown as T; // TODO: remove unknown
      filledData.push(newItem);
    }

    currentDate = currentDate.add(1, dateRangeType);
  }

  return filledData;
};

/**
 * Generates a list of dates between two specified dates, inclusive of both the start and end dates.
 *
 * @param dateFrom - The starting date of the range.
 * @param dateTo - The ending date of the range.
 * @param unit - The granularity of the date intervals (e.g., 'day', 'week', 'month', etc.).
 * @returns - An array of dates between the specified range, incremented by the provided unit.
 *
 * Example:
 * If `dateFrom` is '2023-01-01', `dateTo` is '2023-01-03', and `unit` is 'day',
 * the function will return ['2023-01-01', '2023-01-02', '2023-01-03'].
 */
export type DateManipulateType =
  | ManipulateType
  | Exclude<QUnitType, "date" | "dates">;

export const getListOfDatesBetween = (
  dateFrom: Dayjs,
  dateTo: Dayjs,
  unit: DateManipulateType
) => {
  const list: Array<Dayjs> = [];

  const endWithUnit = dateTo.endOf(unit);
  if (dateFrom.isBefore(endWithUnit)) {
    for (
      let date = dateFrom;
      date.isBefore(endWithUnit) || date.isSame(endWithUnit);
      date =
        unit === "quarter" || unit === "quarters" || unit === "Q"
          ? date.add(3, "month").startOf(unit)
          : date.add(1, unit).startOf(unit)
    ) {
      list.push(date);
    }
  }
  if (list.length === 0) {
    list.push(dateFrom.startOf(unit));
  }
  return list;
};

export const getListOfDateRangesBetween = (
  dateFrom: Dayjs,
  dateTo: Dayjs,
  unit: DateManipulateType
) => {
  return getListOfDatesBetween(dateFrom, dateTo, unit).map((date) => [
    date.startOf(unit),
    date.endOf(unit),
  ]);
};

/**
 * @deprecated use get instead getListOfDateRangesBetween
 *
 * Generates a list of date windows (start and end date pairs) based on the provided parameters.
 *
 * @param dateFrom - The starting date of the first window.
 * @param dateTo - The ending date of the first window.
 * @param count - The number of date windows to generate.
 * @param step - The number of units to increment for each subsequent window.
 * @param unit - The granularity of the date intervals (e.g., 'day', 'week', 'month', etc.).
 * @returns - An array of date windows, each containing a 'from' and 'to' date.
 *
 * Example:
 * If `dateFrom` is '2023-07-01', `dateTo` is '2024-06-30', `count` is 2, `step` is 1, and `unit` is 'year',
 * the function will return:
 * [
 *   { from: '2023-07-01', to: '2024-06-30' },
 *   { from: '2024-07-01', to: '2025-06-30' }
 * ]
 */
export const getDateWindows = (
  dateFrom: Dayjs,
  dateTo: Dayjs,
  count: number,
  step: number,
  unit: ManipulateType
) => {
  return Array.from({ length: count }, (_, i) => ({
    from: dateFrom.add(i * step, unit),
    to: dateTo.add(i * step, unit),
  }));
};

/**
 * Generates a textual representation of a date range. If the start and end dates are the same (based on the provided unit),
 * only one date is returned. Otherwise, a range in the format "start - end" is returned.
 *
 * @param dateFrom - The starting date of the range.
 * @param dateTo - The ending date of the range.
 * @param unit - The granularity to determine if the start and end dates are the same (e.g., 'day', 'week', 'month', 'year', etc.).
 *               Default is 'month'.
 * @returns - A string representation of the date range.
 *
 * Example:
 * For fiscal years in finances, fiscal years often start on July 1 and end on June 30 of the following year.
 * If `dateFrom` is '2023-07-01' and `dateTo` is '2024-06-30' with `unit` as 'year',
 * the function will return '07/23 - 06/24'.
 * If `dateFrom` is '2023-07-01' and `dateTo` is '2023-07-01' with `unit` as 'month',
 * the function will return '07/23'.
 */
type FormatDateRangeUnit = DateManipulateType | "auto";
export const formatDateRange = (
  dateFrom: Dayjs | string,
  dateTo: Dayjs | string,
  unit: FormatDateRangeUnit = "auto"
) => {
  let format: string;
  let formatFirst: string;

  const _from = dayjs(dateFrom);
  const _to = dayjs(dateTo);
  const _unit = autodetectUnitType(_from, _to, unit);
  const sameYear = _from.isSame(_to, "year");

  switch (_unit) {
    case "year":
      format = "YYYY";
      formatFirst = "YYYY";
      break;
    case "month":
      format = "MM/YY";
      formatFirst = sameYear ? "MM" : "MM/YY";
      break;
    case "day":
      format = "D/M/YY";
      formatFirst = sameYear ? "D/M" : "D/M/YY";
      break;
    case "week":
      format = "W./YY";
      formatFirst = sameYear ? "W." : "W./YY";
      break;
    case "quarter":
      format = "[Q]Q/YY";
      formatFirst = sameYear ? "[Q]Q" : "[Q]Q/YY";
      break;
    default:
      format = "MM/YY";
      formatFirst = sameYear ? "MM" : "MM/YY";
  }

  const isQuarterUnit =
    _unit === "quarter" || _unit === "quarters" || _unit === "Q";

  return isQuarterUnit || _from.isSame(_to, _unit)
    ? _from.format(format)
    : `${_from.format(formatFirst)}-${_to.format(format)}`;
};

const autodetectUnitType = (
  dateFrom: Dayjs,
  dateTo: Dayjs,
  unit: FormatDateRangeUnit = "auto"
): DateManipulateType => {
  if (unit !== "auto") return unit;
  if (
    !dateFrom.isSame(dateFrom.startOf("month")) ||
    !dateTo.isSame(dateTo.endOf("month"))
  ) {
    return "day";
  }
  if (
    !dateFrom.isSame(dateFrom.startOf("year")) ||
    !dateTo.isSame(dateTo.endOf("year"))
  ) {
    return "month";
  }
  return "year";
};

/**
 * @deprecated use formatDateRange instead
 */
export const getTextForDateRange = (
  dateFrom: Dayjs | string,
  dateTo: Dayjs | string,
  unit: DateManipulateType = "month"
) => {
  return formatDateRange(dateFrom, dateTo, unit);
};

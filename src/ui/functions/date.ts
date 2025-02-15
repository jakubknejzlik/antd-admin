import dayjs, { Dayjs } from "dayjs";

import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export function formatDate(
  date: Dayjs | Date | string | null,
  format: string = "l"
): string {
  if (!date) {
    return "–";
  }
  const d = dayjs(date);
  if (!d.isValid()) {
    return "–";
  }
  return d.format(format);
}

export function formatDateTime(
  date: Dayjs | Date | string | null,
  format: string = "lll"
): string {
  if (!date) {
    return "–";
  }
  const d = dayjs(date);
  if (!d.isValid()) {
    return "–";
  }
  return d.format(format);
}

import dayjs, { Dayjs } from "dayjs";

import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export function formatDate(
  date: Dayjs | string | null,
  format: string = "l"
): string {
  const d = dayjs(date);
  if (!d.isValid()) {
    return "–";
  }
  return d.format(format);
}

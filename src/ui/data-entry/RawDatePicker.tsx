import { DatePicker, DatePickerProps } from "antd";
import dayjs from "dayjs";

interface IsoDatePickerProps
  extends Omit<DatePickerProps, "value" | "onChange"> {
  value?: Date | string;
  onChange?: (value: Date) => void;
}

export const RawDatePicker = ({
  value,
  onChange,
  ...props
}: IsoDatePickerProps) => {
  const val = value && dayjs(value);
  return (
    <DatePicker
      value={val && val.isValid() ? val : null}
      onChange={(val) => onChange?.(val?.toDate() ?? null)}
      {...props}
    />
  );
};

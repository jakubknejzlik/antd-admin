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
  const val = dayjs(value);
  return (
    <DatePicker
      value={val.isValid() ? val : undefined}
      onChange={(val) => onChange?.(val?.toDate())}
      {...props}
    />
  );
};

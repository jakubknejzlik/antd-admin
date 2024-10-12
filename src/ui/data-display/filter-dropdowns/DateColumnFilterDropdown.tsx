import { useQuery } from "@tanstack/react-query";
import { DatePicker, Space, Spin } from "antd";
import { FilterValue } from "antd/es/table/interface";
import dayjs from "dayjs";
import { EntityItem } from "../../types/shared";
import { TableColumnStatsQuery } from "../QueryTable";

interface DateColumnFilterDropdownProps<T extends EntityItem> {
  value: FilterValue;
  onChange?: (value: FilterValue) => void;
  columnStatQuery?: TableColumnStatsQuery<T> & { column: string };
}

export const DateColumnFilterDropdown = <T extends EntityItem>({
  value,
  onChange,
  columnStatQuery,
}: DateColumnFilterDropdownProps<T>) => {
  const { column, queryFn, queryKey, ...rest } = columnStatQuery ?? {};

  const { data, isLoading } = useQuery({
    queryKey: [...(queryKey ?? []), column],
    queryFn: async () => {
      return queryFn!({
        column: column!,
        pagination: {
          current: 0,
          pageSize: 100,
        },
      });
    },
    enabled: columnStatQuery !== undefined,
    ...rest,
  });

  if (isLoading) {
    return <Spin />;
  }

  const from = value?.[0] && value?.[0]?.toString();
  const to = value?.[1] && value?.[1]?.toString();

  return (
    <Space direction="vertical">
      <Space>
        <DatePicker.RangePicker
          value={[from ? dayjs(from) : null, to ? dayjs(to) : null]}
          onChange={(value) => {
            onChange?.(
              (value || []).map((d) => (d ? d.toISOString() : null)) as string[]
            );
          }}
          minDate={data ? dayjs(data.min) : undefined}
          maxDate={data ? dayjs(data.max) : undefined}
        />
      </Space>
    </Space>
  );
};

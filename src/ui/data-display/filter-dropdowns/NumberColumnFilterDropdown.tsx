import { useQuery } from "@tanstack/react-query";
import { Alert, InputNumber, Slider, Space, Spin } from "antd";
import { FilterValue } from "antd/es/table/interface";
import { EntityItem } from "../../types/shared";
import { TableColumnStatsQuery } from "../QueryTable";

interface NumberColumnFilterDropdownProps<T extends EntityItem> {
  value: FilterValue;
  onChange?: (value: FilterValue) => void;
  columnStatQuery?: TableColumnStatsQuery<T> & { column: string };
}

export const NumberColumnFilterDropdown = <T extends EntityItem>({
  value,
  onChange,
  columnStatQuery,
}: NumberColumnFilterDropdownProps<T>) => {
  const { column, queryFn, queryKey, ...rest } = columnStatQuery ?? {};

  const { data, isLoading, error } = useQuery({
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
  if (error) {
    return (
      <Alert
        message="Error"
        description={error.message}
        type="error"
        showIcon
      />
    );
  }

  const from = value?.[0] && value?.[0]?.toString();
  const to = value?.[1] && value?.[1]?.toString();

  return (
    <Space direction="vertical">
      {data && data.min !== data.max && (
        <div style={{ padding: "0 1em" }}>
          <Slider
            range
            value={[
              from ? parseInt(from, 10) : data.min,
              to ? parseInt(to, 10) : data.max,
            ]}
            min={data.min}
            max={data.max}
            onChange={(value) => {
              onChange?.([value[0] ?? data.min, value[1] ?? data.max]);
            }}
          />
        </div>
      )}
      <Space>
        <InputNumber
          value={(value?.[0] && value?.[0]?.toString()) || null}
          onChange={(val) => {
            onChange?.([val ? val.toString() : false, value?.[1] ?? false]);
          }}
          placeholder={data?.min}
          min={data?.min}
        />
        -
        <InputNumber
          value={(value?.[1] && value?.[1]?.toString()) || null}
          onChange={(val) => {
            onChange?.([value?.[0] ?? false, val ? val.toString() : false]);
          }}
          placeholder={data?.max}
          max={data?.max}
        />
      </Space>
    </Space>
  );
};

import { useQuery } from "@tanstack/react-query";
import { SearchOutlined } from "@ant-design/icons";
import { Alert, Input, Select, Spin } from "antd";
import { FilterValue } from "antd/es/table/interface";
import { TableColumnStatsQuery } from "../QueryTable";
import { EntityItem } from "../../types/shared";

interface StringColumnFilterDropdownProps<T extends EntityItem> {
  value: FilterValue;
  onChange?: (value: FilterValue) => void;
  columnStatQuery?: TableColumnStatsQuery<T> & { column: string };
}

export const StringColumnFilterDropdown = <T extends EntityItem>({
  value,
  onChange,
  columnStatQuery,
}: StringColumnFilterDropdownProps<T>) => {
  const { column, queryFn, queryKey, ...rest } = columnStatQuery ?? {};

  console.log(columnStatQuery);
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
    return <Alert type="error" message={error.message} />;
  }

  if (data && data?.valuesTotal < 10 && data?.valuesTotal > 0) {
    return (
      <Select
        mode="multiple"
        maxTagCount={3}
        allowClear
        style={{ width: "100%", minWidth: 200 }}
        options={data.values.map((value) => ({ value, label: value }))}
        value={value}
        onChange={(value) => {
          onChange?.(value || []);
        }}
      />
    );
  }

  return (
    <Input
      value={value?.[0]?.toString()}
      onChange={(e) => {
        onChange?.([e.target.value]);
      }}
      onClear={() => {
        onChange?.([]);
      }}
      prefix={<SearchOutlined />}
      placeholder="Search"
    />
  );
};

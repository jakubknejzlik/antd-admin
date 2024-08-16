import { ColumnGroupType, ColumnType } from "antd/es/table";
import { formatDate } from "../functions/date";
import { formatNumber } from "../functions/numeral";
import { StringColumnFilterDropdown } from "./filter-dropdowns/StringColumnFilterDropdown";
import { QueryTableState } from "./QueryTable";
import { Button, Divider, Flex, Space } from "antd";
import { ColumnFilterDropdown } from "./filter-dropdowns/ColumnFilterDropdown";

type ColumnBase<RecordType> = ColumnType<RecordType> & {
  name: string;
};
type StringColumnType<RecordType> = ColumnBase<RecordType> & {
  type: "string";
};
type NumberColumnType<RecordType> = ColumnBase<RecordType> & {
  type: "number";
  format?: string;
};
type DateColumnType<RecordType> = ColumnBase<RecordType> & {
  type: "date";
  format?: string;
};

export type TableColumnType<RecordType> =
  | StringColumnType<RecordType>
  | NumberColumnType<RecordType>
  | DateColumnType<RecordType>;

export type InitialTableColumn<RecordType> =
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>;

export type TableColumn<RecordType> =
  | InitialTableColumn<RecordType>
  | TableColumnType<RecordType>;

export const columnTypeForTableColumnType = <RecordType,>(
  c: TableColumn<RecordType>,
  state: QueryTableState
): InitialTableColumn<RecordType> => {
  if ("children" in c) {
    const { children, ...rest } = c;
    return {
      children: children.map((c) => columnTypeForTableColumnType(c, state)),
      ...rest,
    };
  }
  const defaultProps: Partial<ColumnType<RecordType>> = {
    sorter: true,
    sortOrder: state.sorter.find((s) => s.field === c.dataIndex)?.order,
    showSorterTooltip: false,
    filteredValue: c.dataIndex ? state.filters[c.dataIndex.toString()] : [],
    filterDropdown: (props) => {
      const { selectedKeys, setSelectedKeys } = props;
      return (
        <ColumnFilterDropdown {...props}>
          <StringColumnFilterDropdown
            value={selectedKeys}
            onChange={(value) => {
              setSelectedKeys(value);
            }}
          />
        </ColumnFilterDropdown>
      );
    },
  };

  if (!("type" in c)) {
    return { ...defaultProps, ...c };
  }

  switch (c.type) {
    case "number":
      return {
        render: (value) => formatNumber(value, c.format),
        ...defaultProps,
        ...c,
      };
    case "string":
      return {
        ...defaultProps,
        ...c,
      };
    case "date":
      return {
        render: (value) => formatDate(value, c.format),
        ...defaultProps,
        ...c,
      };
  }
};

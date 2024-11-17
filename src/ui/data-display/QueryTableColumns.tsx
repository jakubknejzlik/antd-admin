import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { ColumnGroupType, ColumnType } from "antd/es/table";
import { formatDate } from "../functions/date";
import { formatNumber } from "../functions/numeral";
import { EntityItem } from "../types/shared";
import { BooleanColumnFilterDropdown } from "./filter-dropdowns/BooleanColumnFilterDropdown";
import { ColumnFilterDropdown } from "./filter-dropdowns/ColumnFilterDropdown";
import { NumberColumnFilterDropdown } from "./filter-dropdowns/NumberColumnFilterDropdown";
import { StringColumnFilterDropdown } from "./filter-dropdowns/StringColumnFilterDropdown";
import { QueryTableState, TableColumnStatsQuery } from "./QueryTable";
import { DateColumnFilterDropdown } from "./filter-dropdowns/DateColumnFilterDropdown";

type ColumnBase<RecordType> = ColumnType<RecordType>;
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
type BooleanColumnType<RecordType> = ColumnBase<RecordType> & {
  type: "boolean";
};

export type TableColumnType<RecordType> =
  | StringColumnType<RecordType>
  | NumberColumnType<RecordType>
  | DateColumnType<RecordType>
  | BooleanColumnType<RecordType>;

export type InitialTableColumn<RecordType> =
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>;

export type TableColumn<RecordType> =
  | InitialTableColumn<RecordType>
  | TableColumnType<RecordType>;

export const columnTypeForTableColumnType = <RecordType extends EntityItem>(
  column: string | undefined,
  c: TableColumn<RecordType>,
  state: QueryTableState,
  columnStatQuery?: TableColumnStatsQuery<RecordType>
): InitialTableColumn<RecordType> => {
  if ("children" in c) {
    const { children, ...rest } = c;
    return {
      children: children.map((c) =>
        columnTypeForTableColumnType(column, c, state, columnStatQuery)
      ),
      ...rest,
    };
  }
  const defaultProps: Partial<ColumnType<RecordType>> = {
    sorter: true,
    sortOrder: state.sorter.find((s) => s.field === c.dataIndex)?.order,
    showSorterTooltip: false,
    filteredValue: c.dataIndex
      ? state.filters[c.dataIndex.toString()] || null
      : null,
    filterDropdown: (props) => {
      const { selectedKeys, setSelectedKeys } = props;
      return (
        <ColumnFilterDropdown {...props}>
          <StringColumnFilterDropdown
            value={selectedKeys}
            onChange={(value) => {
              setSelectedKeys(value as React.Key[]);
            }}
            columnStatQuery={
              columnStatQuery && column
                ? { ...columnStatQuery, column }
                : undefined
            }
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
        ...defaultProps,
        align: "right",
        render: (value) => formatNumber(value, c.format),
        filterDropdown: (props) => {
          const { selectedKeys, setSelectedKeys } = props;
          return (
            <ColumnFilterDropdown orientation="vertical" {...props}>
              <NumberColumnFilterDropdown
                value={selectedKeys}
                onChange={(value) => {
                  setSelectedKeys(value as React.Key[]);
                }}
                columnStatQuery={
                  columnStatQuery && column
                    ? { ...columnStatQuery, column }
                    : undefined
                }
              />
            </ColumnFilterDropdown>
          );
        },
        ...c,
      };
    case "string":
      return {
        ...defaultProps,
        ...c,
      };
    case "date":
      return {
        ...defaultProps,
        align: "center",
        render: (value) => formatDate(value, c.format ?? "lll"),
        filterDropdown: (props) => {
          const { selectedKeys, setSelectedKeys } = props;
          return (
            <ColumnFilterDropdown {...props}>
              <DateColumnFilterDropdown
                value={selectedKeys}
                onChange={(value) => {
                  setSelectedKeys(value as React.Key[]);
                }}
                columnStatQuery={
                  columnStatQuery && column
                    ? { ...columnStatQuery, column }
                    : undefined
                }
              />
            </ColumnFilterDropdown>
          );
        },
        ...c,
      };
    case "boolean":
      return {
        ...defaultProps,
        align: "center",
        render: (value) => (value ? <CheckOutlined /> : <CloseOutlined />),
        filterDropdown: (props) => {
          const { selectedKeys, setSelectedKeys } = props;
          return (
            <ColumnFilterDropdown {...props}>
              <BooleanColumnFilterDropdown
                value={selectedKeys}
                onChange={(value) => {
                  setSelectedKeys(value as React.Key[]);
                }}
              />
            </ColumnFilterDropdown>
          );
        },
        ...c,
      };
  }
};

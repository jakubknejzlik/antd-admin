import { ColumnGroupType, ColumnType } from "antd/es/table";
import { formatDate } from "../functions/date";
import { formatNumber } from "../functions/numeral";
import { QueryTableState } from "./QueryTable";

type StringColumnType<RecordType> = ColumnType<RecordType> & {
  type: "string";
};
type NumberColumnType<RecordType> = ColumnType<RecordType> & {
  type: "number";
  format?: string;
};
type DateColumnType<RecordType> = ColumnType<RecordType> & {
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
      return { ...defaultProps, ...c };
    case "date":
      return {
        render: (value) => formatDate(value, c.format),
        ...defaultProps,
        ...c,
      };
  }
};

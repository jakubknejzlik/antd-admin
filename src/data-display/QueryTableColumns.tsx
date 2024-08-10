import { ColumnGroupType, ColumnType } from "antd/es/table";

type StringColumnType<RecordType> = ColumnType<RecordType> & {
  type: "string";
};
type NumberColumnType<RecordType> = ColumnType<RecordType> & {
  type: "number";
};

export type TableColumnType<RecordType> =
  | StringColumnType<RecordType>
  | NumberColumnType<RecordType>;

export type InitialTableColumn<RecordType> =
  | ColumnGroupType<RecordType>
  | ColumnType<RecordType>;

export type TableColumn<RecordType> =
  | InitialTableColumn<RecordType>
  | TableColumnType<RecordType>;

export const columnTypeForTableColumnType = <RecordType,>(
  c: TableColumn<RecordType>
): InitialTableColumn<RecordType> => {
  if ("children" in c) {
    const { children, ...rest } = c;
    return {
      children: children.map((c) => columnTypeForTableColumnType(c)),
      ...rest,
    };
  }

  if (!("type" in c)) {
    return c;
  }

  const defaultProps: Partial<ColumnType<RecordType>> = {
    sorter: true,
  };
  switch (c.type) {
    case "number":
      return { render: (value) => `number: ${value}`, ...defaultProps, ...c };
    case "string":
      return { ...defaultProps, ...c };
  }
};

import { AnyZodObject, z, ZodTypeAny } from "zod";
import { QueryTableColumns } from "../ui/data-display/QueryTable";
import { TableColumnType } from "../ui/data-display/QueryTableColumns";
import { EntityField } from "../ui/entity/entity-fields";
import { EntityItem } from "../ui/types/shared";
import { Tooltip } from "antd";

type ColumnKeyObject<T extends EntityItem, U extends AnyZodObject> = {
  dataIndex: keyof U["shape"];
  type?: TableColumnType<T>["type"];
} & Omit<QueryTableColumns<T>, "dataKey">;
type ColumnKey<T extends EntityItem, U extends AnyZodObject> =
  | keyof U["shape"]
  | ColumnKeyObject<T, U>;

const maxColumnLength = 50;

export function getEntityListColumnsFromSchema<
  T extends EntityItem,
  U extends AnyZodObject,
>(schema: U, keys?: ColumnKey<T, U>[]): QueryTableColumns<T>[] {
  const getColumnType = (field: ZodTypeAny): TableColumnType<T>["type"] => {
    if (field instanceof z.ZodString) {
      return "string";
    } else if (field instanceof z.ZodNumber) {
      return "number";
    } else if (field instanceof z.ZodBoolean) {
      return "boolean";
    } else if (field instanceof z.ZodDate) {
      return "date";
    } else if (field instanceof z.ZodEnum || field instanceof z.ZodNativeEnum) {
      // TODO: Implement select type
      return "string";
    } else if (
      field instanceof z.ZodOptional ||
      field instanceof z.ZodNullable ||
      field instanceof z.ZodReadonly
    ) {
      return getColumnType(field.unwrap());
    } else {
      return "string"; // Default type
    }
  };
  const shape = schema.shape as U["shape"];
  const _keys = keys ?? Object.keys(shape);
  const fields: EntityField<T>[] = _keys
    .map((k) => {
      if (keys && !keys.includes(k)) {
        return null;
      }
      const _k: ColumnKeyObject<T, U> =
        typeof k === "object" ? k : { dataIndex: k };
      const field = shape[_k.dataIndex];
      const zodField = field as ZodTypeAny;
      const type = getColumnType(zodField);
      return {
        type,
        key: _k.dataIndex,
        title: _k.dataIndex,
        render: (value) => {
          if (typeof value === "string" && value.length > maxColumnLength) {
            return (
              <Tooltip title={value}>
                {value.slice(0, maxColumnLength) + "..."}
              </Tooltip>
            );
          }
          return value;
        },
        ..._k,
      } as QueryTableColumns<T>;
    })
    .filter((x) => x !== null) as EntityField<T>[];
  return fields;
}

import { AnyZodObject, z, ZodTypeAny } from "zod";
import { QueryTableColumns } from "../ui/data-display/QueryTable";
import { TableColumnType } from "../ui/data-display/QueryTableColumns";
import { EntityField } from "../ui/entity/entity-fields";
import { EntityItem } from "../ui/types/shared";

export function getEntityListColumnsFromSchema<
  T extends EntityItem,
  U extends AnyZodObject,
>(schema: U, keys?: (keyof U["shape"])[]): QueryTableColumns<T>[] {
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
      field instanceof z.ZodNullable
    ) {
      return getColumnType(field.unwrap());
    } else {
      return "string"; // Default type
    }
  };
  const shape = schema.shape as U["shape"];
  const _keys = keys ?? Object.keys(shape);
  const fields: EntityField<T>[] = _keys
    .map((name) => {
      const field = shape[name];
      const zodField = field as ZodTypeAny;
      const type = getColumnType(zodField);
      if (keys && !keys.includes(name)) {
        return null;
      }
      return {
        key: name,
        dataIndex: name,
        title: name,
        type,
      } as QueryTableColumns<T>;
    })
    .filter((x) => x !== null) as EntityField<T>[];
  return fields;
}

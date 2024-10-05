import { AnyZodObject, z, ZodRawShape, ZodTypeAny } from "zod";
import { EntityField } from "../ui/entity/entity-fields";
import { EntityItem } from "../ui/types/shared";
import { QueryTableColumns } from "../ui/data-display/QueryTable";
import { TableColumnType } from "../ui/data-display/QueryTableColumns";

export function getEntityListColumnsFromSchema<T extends EntityItem>(
  schema: AnyZodObject,
  filter?: string[]
): QueryTableColumns<T>[] {
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
  const shape = schema.shape as ZodRawShape;
  const fields: EntityField<T>[] = Object.entries(shape)
    .map(([name, field]) => {
      const zodField = field as ZodTypeAny;
      const type = getColumnType(zodField);
      if (filter && !filter.includes(name)) {
        return null;
      }
      return {
        dataIndex: name,
        title: name,
        type,
      } as QueryTableColumns<T>;
    })
    .filter((x) => x !== null) as EntityField<T>[];
  return fields;
}

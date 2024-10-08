import { AnyObject } from "antd/es/_util/type";
import { AnyZodObject, z, ZodRawShape, ZodTypeAny } from "zod";
import { EntityField } from "../ui/entity/entity-fields";

export function getEntityFieldsFromSchema<
  U extends AnyZodObject,
  T extends AnyObject = z.infer<U>,
>(schema: U): EntityField<T>[] {
  const getFieldType = (field: ZodTypeAny): EntityField<T>["type"] => {
    if (field instanceof z.ZodString) {
      return "string";
    } else if (field instanceof z.ZodNumber) {
      return "number";
    } else if (field instanceof z.ZodBoolean) {
      return "boolean";
    } else if (field instanceof z.ZodDate) {
      return "date";
    } else if (field instanceof z.ZodEnum || field instanceof z.ZodNativeEnum) {
      return "select";
    } else if (
      field instanceof z.ZodOptional ||
      field instanceof z.ZodNullable ||
      field instanceof z.ZodReadonly
    ) {
      return getFieldType(field.unwrap());
    } else {
      return "string"; // Default type
    }
  };
  const isRequired = (field: ZodTypeAny): boolean => {
    return !field.isNullable() && !field.isOptional();
  };
  const shape = schema.shape as ZodRawShape;
  const fields: EntityField<T>[] = Object.entries(shape)
    .map(([name, field]) => {
      const zodField = field as ZodTypeAny;
      const type = getFieldType(zodField);
      const required = isRequired(zodField);
      if (field instanceof z.ZodReadonly) {
        return null;
      }
      return {
        name,
        label: name,
        type,
        required,
        validationRules: [
          {
            validator: async (_, value) => {
              const result = zodField.safeParse(value);
              if (result.error) {
                return Promise.reject(
                  result.error.errors.map((e) => e.message).join(", ")
                );
              }
            },
          },
        ],
      } as EntityField<T>;
    })
    .filter((x) => x !== null) as EntityField<T>[];
  return fields;
}

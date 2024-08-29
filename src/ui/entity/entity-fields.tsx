import { DatePicker, Input, InputNumber, Switch } from "antd";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";

export type EntityFieldBase<T> = {
  type: unknown;
  name: string;
  label?: string;
  required?: boolean;
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
};
export type EntityStringField<T> = EntityFieldBase<T> & {
  type: "string";
};
export type EntityNumberField<T> = EntityFieldBase<T> & {
  type: "number";
};
export type EntityDateField<T> = EntityFieldBase<T> & {
  type: "date";
};
export type EntityBooleanField<T> = EntityFieldBase<T> & {
  type: "boolean";
};
export type EntitySelectField<T> = EntityFieldBase<T> & {
  type: "select";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  targetEntity: () => Entity<any, any>;
};

export type EntityField<T extends EntityItem> =
  | EntityStringField<T>
  | EntityNumberField<T>
  | EntityDateField<T>
  | EntityBooleanField<T>
  | EntitySelectField<T>;

export const inputForField = <T extends EntityItem>(field: EntityField<T>) => {
  switch (field.type) {
    case "number":
      return <InputNumber />;
    case "date":
      return <DatePicker />;
    case "boolean":
      return <Switch />;
    case "select":
      return field.targetEntity().getSelectComponent();
    default:
    case "string":
      return <Input />;
  }
};

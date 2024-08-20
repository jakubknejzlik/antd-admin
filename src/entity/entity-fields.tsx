import { DatePicker, Input, InputNumber, Switch } from "antd";
import { Entity } from "./entity";
import { EntityItem } from "../types/shared";

export type EntityFieldBase = {
  name: string;
  label?: string;
  type: unknown;
};
export type EntityStringField = EntityFieldBase & {
  type: "string";
};
export type EntityNumberField = EntityFieldBase & {
  type: "number";
};
export type EntityDateField = EntityFieldBase & {
  type: "date";
};
export type EntityBooleanField = EntityFieldBase & {
  type: "boolean";
};
export type EntitySelectField<T extends EntityItem> = EntityFieldBase & {
  type: "select";
  targetEntity: () => Entity<T>;
};

export type EntityField<T extends EntityItem> =
  | EntityStringField
  | EntityNumberField
  | EntityDateField
  | EntityBooleanField
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

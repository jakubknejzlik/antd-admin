import { DatePicker, Input, InputNumber, Switch } from "antd";
import { Entity } from "./entity";

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
export type EntitySelectField = EntityFieldBase & {
  type: "select";
  targetEntity: () => Entity;
};

export type EntityField =
  | EntityStringField
  | EntityNumberField
  | EntityDateField
  | EntityBooleanField
  | EntitySelectField;

export const inputForField = (field: EntityField) => {
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

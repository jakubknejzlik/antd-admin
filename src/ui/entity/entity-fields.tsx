import { Input, InputNumber, Select, SelectProps, Switch } from "antd";
import { Rule } from "antd/es/form";
import { RawDatePicker } from "../data-entry/RawDatePicker";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";

export type EntityFieldBase<T> = {
  type: unknown;
  name: string;
  label?: string;
  required?: boolean;
  validationRules?: Rule[];
  render?: (value: unknown, item: T, index: number) => React.ReactNode;
};
export type EntityStringField<T> = EntityFieldBase<T> & {
  type: "string";
  maxLength?: number;
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
export type EntityEnumField<T> = EntityFieldBase<T> & {
  type: "enum";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: SelectProps["options"];
};

export type EntityField<T extends EntityItem> =
  | EntityStringField<T>
  | EntityNumberField<T>
  | EntityDateField<T>
  | EntityBooleanField<T>
  | EntitySelectField<T>
  | EntityEnumField<T>;

export const inputForField = <T extends EntityItem>(field: EntityField<T>) => {
  switch (field.type) {
    case "number":
      return <InputNumber />;
    case "date":
      return <RawDatePicker showTime />;
    case "boolean":
      return <Switch />;
    case "select":
      return field.targetEntity().getSelectComponent();
    case "enum":
      return <Select options={field.options} />;
    default:
    case "string":
      return <Input />;
  }
};

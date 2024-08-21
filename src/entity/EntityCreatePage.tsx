import { useNavigate } from "@tanstack/react-router";
import { Card, Form } from "antd";
import { QueryForm } from "../data-entry/QueryForm";
import { OptionType } from "../data-entry/QuerySelect";
import { Page } from "../layout";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";
import { EntityField, inputForField } from "./entity-fields";

export type EntityCreatePageProps<
  T extends EntityItem,
  S extends OptionType,
> = {
  entity: Entity<T, S>;
  fields?: EntityField<T>[];
};

export const EntityCreatePage = <T extends EntityItem, S extends OptionType>({
  entity,
  fields,
}: EntityCreatePageProps<T, S>) => {
  const { name, rootRoute, createMutationFn } = entity.config;
  const _fields = fields ?? entity.fields;
  const navigate = useNavigate();
  return (
    <Page>
      <Card title={`Create new ${name}`}>
        <QueryForm
          mutation={{
            mutationFn: createMutationFn,
            onSuccess: () => {
              navigate(rootRoute);
            },
          }}
        >
          {_fields.map((field) => (
            <Form.Item
              label={field.label ?? field.name}
              name={field.name}
              rules={field.required ? [{ required: true }] : []}
            >
              {inputForField(field)}
            </Form.Item>
          ))}
        </QueryForm>
      </Card>
    </Page>
  );
};

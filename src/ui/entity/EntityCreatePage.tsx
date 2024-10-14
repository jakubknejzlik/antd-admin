import { useNavigate } from "@tanstack/react-router";
import { Card, CardProps, Form } from "antd";
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
  card?: Partial<CardProps>;
};

export const EntityCreatePage = <T extends EntityItem, S extends OptionType>({
  entity,
  fields,
  card,
}: EntityCreatePageProps<T, S>) => {
  const { name, rootRoute, dataSource } = entity.config;
  const _fields = fields ?? entity.fields;
  const navigate = useNavigate();
  return (
    <Page>
      <Card title={`Create new ${name}`} {...card}>
        <QueryForm
          mutation={{
            mutationFn: dataSource.createMutationFn,
            onSuccess: () => {
              navigate(rootRoute);
            },
          }}
        >
          {_fields.map((field) => (
            <Form.Item
              key={field.name}
              label={field.label ?? field.name}
              name={field.name}
              rules={
                field.required
                  ? [...(field.validationRules ?? []), { required: true }]
                  : field.validationRules
              }
            >
              {inputForField(field)}
            </Form.Item>
          ))}
        </QueryForm>
      </Card>
    </Page>
  );
};

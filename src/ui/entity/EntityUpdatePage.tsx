import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Card, CardProps, Form } from "antd";
import { QueryEditForm, QueryEditFormProps } from "../data-entry/QueryEditForm";
import { OptionType } from "../data-entry/QuerySelect";
import { Page } from "../layout";
import { EntityItem } from "../types/shared";
import { Entity } from "./entity";
import { EntityField, inputForField } from "./entity-fields";

export type EntityUpdatePageProps<
  T extends EntityItem,
  S extends OptionType,
> = Partial<QueryEditFormProps<T>> & {
  id: string;
  entity: Entity<T, S>;
  fields?: EntityField<T>[];
  card?: Partial<CardProps>;
};

export const EntityUpdatePage = <T extends EntityItem, S extends OptionType>({
  id,
  entity,
  fields,
  card,
  ...props
}: EntityUpdatePageProps<T, S>) => {
  const { name, rootRoute, dataSource } = entity.config;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const _fields = fields ?? entity.fields;

  const getQueryFn = dataSource.crud?.getQueryFn;
  const updateMutationFn = dataSource.crud?.updateMutationFn;

  return (
    <Page>
      <Card title={`Update ${name}`} {...card}>
        <QueryEditForm
          query={{
            queryKey: [name, "get", { id }],
            queryFn: getQueryFn
              ? () => {
                  return getQueryFn({ id });
                }
              : undefined,
          }}
          mutation={{
            mutationFn: updateMutationFn
              ? async (values) => {
                  return updateMutationFn({ ...values, id });
                }
              : undefined,
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: [rootRoute.to, "list"],
              });
              navigate(rootRoute);
            },
          }}
          {...props}
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
        </QueryEditForm>
      </Card>
    </Page>
  );
};

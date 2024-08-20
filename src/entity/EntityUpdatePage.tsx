import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Card, Form } from "antd";
import { QueryEditForm } from "../data-entry/QueryEditForm";
import { Page } from "../layout";
import { EntityConfig } from "./entity";
import { EntityField, inputForField } from "./entity-fields";
import { EntityItem } from "../types/shared";
import { OptionType } from "../data-entry/QuerySelect";

type EntityUpdatePageProps<T extends EntityItem, S extends OptionType> = {
  id: string;
  config: EntityConfig<T, S>;
  fields: EntityField<T>[];
};

export const EntityUpdatePage = <T extends EntityItem, S extends OptionType>({
  id,
  config,
  fields,
}: EntityUpdatePageProps<T, S>) => {
  const { name, rootRoute, getQueryFn, updateMutationFn } = config;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return (
    <Page>
      <Card title={`Update ${name}`}>
        <QueryEditForm
          query={{
            queryKey: ["organization", "get", { id }],
            queryFn: getQueryFn
              ? () => {
                  return getQueryFn?.(id);
                }
              : undefined,
          }}
          mutation={{
            mutationFn: async (values) => {
              return updateMutationFn?.(id, values);
            },
            onSuccess: async () => {
              await queryClient.invalidateQueries({
                queryKey: [rootRoute.to, "list"],
              });
              navigate(rootRoute);
            },
          }}
        >
          {fields.map((field) => (
            <Form.Item
              key={field.name}
              label={field.label ?? field.name}
              name={field.name}
            >
              {inputForField(field)}
            </Form.Item>
          ))}
        </QueryEditForm>
      </Card>
    </Page>
  );
};

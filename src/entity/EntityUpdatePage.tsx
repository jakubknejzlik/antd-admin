import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Card, Form } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { QueryEditForm } from "../data-entry/QueryEditForm";
import { Page } from "../layout";
import { EntityListItem } from "../pages/EntityList";
import { EntityConfig } from "./entity";
import { EntityField, inputForField } from "./entity-fields";

type EntityUpdatePageProps<
  T extends AnyObject = AnyObject,
  L extends EntityListItem = EntityListItem,
> = {
  id: string;
  config: EntityConfig<T, L>;
  fields: EntityField[];
};

export const EntityUpdatePage = ({
  id,
  config,
  fields,
}: EntityUpdatePageProps) => {
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

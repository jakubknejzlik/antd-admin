import { useNavigate } from "@tanstack/react-router";
import { Card, Form } from "antd";
import { AnyObject } from "antd/es/_util/type";
import { QueryForm } from "../data-entry/QueryForm";
import { Page } from "../layout";
import { EntityListItem } from "../pages/EntityList";
import { EntityConfig } from "./entity";
import { EntityField, inputForField } from "./entity-fields";

type EntityCreatePageProps<
  T extends AnyObject = AnyObject,
  L extends EntityListItem = EntityListItem,
> = {
  config: EntityConfig<T, L>;
  fields: EntityField[];
};

export const EntityCreatePage = ({ config, fields }: EntityCreatePageProps) => {
  const { name, rootRoute, createMutationFn } = config;
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
          {fields.map((field) => (
            <Form.Item label={field.label ?? field.name} name={field.name}>
              {inputForField(field)}
            </Form.Item>
          ))}
        </QueryForm>
      </Card>
    </Page>
  );
};
